import React, { useState, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'react-flow-renderer';
import { nodes as initialNodes, edges as initialEdges } from '../constant/initial-elements';
import { nodeTypes } from './common/nodes';
import '../style/OverviewFlow.scss'

/**
 * 該element是節點or連接線
 * @param element 
 * @returns 'EDGE' || 'NODE' 
 */
function isNodeOrEdge(element) {
    if (element?.source) {
        return 'EDGE';
    } else {
        return 'NODE';
    }
}

/**
 * 根據節點回傳mermaid shape code
 * @param {} node
 */
function shapeCode(node) {
    switch (node.type) {
        case "circle":
            return ["((", "))"];
        case "rhombus":
            return ["{", "}"];
        default:
            return ["(", ")"];
    }
}

const OverviewFlow = () => {
    const [inputData, setInputData] = useState({
        newNodeName: '',
        editElementName: '',
    });
    // 當前focus的element (node or edge)
    const [activeElement, setActiveElement] = useState();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [mermaidCode, setMermaidCode] = useState('');
    // 所有node, edge, viewport
    const [reactFlowInstance, setReactFlowInstance] = useState();
    const onConnect = (params) => {
        params.markerEnd = {type: MarkerType.ArrowClosed};
        setEdges((eds) => addEdge(params, eds));
    };

    const onInit = (reactFlowInstance) => {
        setReactFlowInstance(reactFlowInstance);
        if (localStorage.getItem('lastSavedFlowObject')) {
            // 若上次有儲存狀態回復上次狀態
            const { nodes, edges } = JSON.parse(localStorage.getItem('lastSavedFlowObject'));
            setNodes(nodes);
            setEdges(edges);
        }
    };

    useEffect(() => {
        if (activeElement) {
            setInputData({
                ...inputData,
                editElementName: isNodeOrEdge(activeElement) === 'EDGE' ? (activeElement.label ?? '') : activeElement.data.label
            });
        }
    }, [activeElement]);

    /**
     * 將所有nodes & edges清除
     */
    const clearAllHandler = () => {
        setNodes([]);
        setEdges([]);
    };

    /**
     * 儲存react flow nodes & edges狀態object 至 localStorage
     */
    const saveHandler = () => {
        localStorage.setItem('lastSavedFlowObject', JSON.stringify(reactFlowInstance.toObject()));
    };

    /**
     * 導出mermaid code
     */
    const exportMermaidHandler = () => {
        const edges = reactFlowInstance.toObject().edges;
        const nodes = reactFlowInstance.toObject().nodes;
        let nodeMap = {};
        // 產生mermaid code
        let mermaidCode = 'graph TD';
        edges.forEach(edge => {
            if (!nodeMap[edge.source]) {
                nodeMap[edge.source] = nodes.find(node => node.id === edge.source);
            }
            if (!nodeMap[edge.target]) {
                nodeMap[edge.target] = nodes.find(node => node.id === edge.target);
            }
            mermaidCode += `\n  ${edge.source}${shapeCode(nodeMap[edge.source])[0]}${nodeMap[edge.source].data.label}${shapeCode(nodeMap[edge.source])[1]} -->${edge.label ? `|${edge.label}|` : ''} ${edge.target}${shapeCode(nodeMap[edge.target])[0]}${nodeMap[edge.target].data.label}${shapeCode(nodeMap[edge.target])[1]}`;
        })
        // 將孤兒特別畫出來 (沒有連線的node)
        nodes.forEach(node => {
            if (!nodeMap[node.id]) {
                mermaidCode += `\n  ${node.id}${shapeCode(node)[0]}${node.data.label}${shapeCode(node)[1]}`;
            }
        })
        setMermaidCode(mermaidCode);
    };

    /**
     * 新增新節點
     */
    const addNodeHandler = (isInput = false, isOutput = false) => {
        const node = {
            id: Date.now().toString(),
            data: { label: inputData.newNodeName !== '' ? inputData.newNodeName : `節點${reactFlowInstance.getNodes().length + 1}` },
            position: { x: 0, y: 0 }
        }
        if (isInput) {
            node.type = 'input';
        } else if (isOutput) {
            node.type = 'output';
        }
        reactFlowInstance.addNodes(node);
        setInputData({
            ...inputData,
            newNodeName: ''
        });
    };

    /**
     * 更新element文字
     */
    const editElementHandler = () => {
        if (!activeElement) return;
        if (isNodeOrEdge(activeElement) === 'EDGE') {
            setEdges(edges => edges.map(edge => {
                if (edge.id === activeElement.id) {
                    edge = {
                        ...edge,
                        label: inputData.editElementName
                    }
                }
                return edge;
            }));
        } else {
            setNodes(nodes => nodes.map(node => {
                if (node.id === activeElement.id) {
                    node.data = {
                        ...node.data,
                        label: inputData.editElementName
                    }
                }
                return node;
            }));
        }
        setInputData({
            ...inputData,
            editElementName: ''
        })
        setActiveElement(null);
    };

    /**
     * input change handler
     */
    const handleInputChange = (event) => {
        const target = event.target;
        setInputData({
            ...inputData,
            [target.name]: target.value
        });
    };

    /**
     * 當點擊node
     */
    const onNodeClick = ($evt, node) => {
        setActiveElement(node);
    }

    /**
     * 當點擊edge
     */
    const onEdgeClick = ($evt, edge) => {
        setActiveElement(edge);
    }

    /**
     * 更換節點形狀, 若不傳值則改回方形
     * @param {} shape "circle" | "rhombus" 
     */
    const changeToShape = (shape) => {
        if (!activeElement) return;
        //TODO: 需判斷為node
        setNodes(nodes => nodes.map(node => {
            if (node.id === activeElement.id) {
                if (!shape) {
                    node.type = undefined;
                } else {
                    node.type = shape;
                }
            }
            return node;
        }));
    }

    return (
        <>
            <div className="wrap">
                <div className='flow-wrap'>
                    <div className="flow">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={onInit}
                            onNodeClick={onNodeClick}
                            onEdgeClick={onEdgeClick}
                            nodeTypes={nodeTypes}
                            fitView
                            attributionPosition="top-right"
                        >
                            <Controls />
                            <Background color="#aaa" gap={16} />
                        </ReactFlow>

                    </div>
                    <div className="form">
                        <div className='form-row'>
                            <input name="newNodeName" type="text" value={inputData.newNodeName} onChange={handleInputChange} placeholder='新節點名稱' />
                            <button onClick={() => addNodeHandler()}>新增節點</button>
                            <button onClick={() => addNodeHandler(true, false)}>新增起始節點</button>
                            <button onClick={() => addNodeHandler(false, true)}>新增結尾節點</button> <br />
                        </div>
                        <div className='form-row'>
                            <input name="editElementName" type="text" value={inputData.editElementName} onChange={handleInputChange} />
                            <button onClick={editElementHandler}>{isNodeOrEdge(activeElement) === 'EDGE' ? '更新連接線' : '更新節點'}文字</button>
                            <button onClick={() => changeToShape("rhombus")}>菱形</button>
                            <button onClick={() => changeToShape("circle")}>圓形</button>
                            <button onClick={() => changeToShape()}>方形</button>
                        </div>
                        <div>
                            <button onClick={clearAllHandler}>清除所有</button>
                            <button onClick={saveHandler}>儲存</button>
                        </div>
                        <button className='export-btn' onClick={exportMermaidHandler}>導出</button>
                    </div>

                </div>
                <div className='code-wrap'>
                    <textarea className='code-textarea' disabled value={mermaidCode} />
                    <button className='copy-btn' onClick={() => navigator.clipboard.writeText(mermaidCode)}>複製</button>
                </div>
            </div>
        </>
    );
};

export default OverviewFlow;
