import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, {
    addEdge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'react-flow-renderer';
import '../style/OverviewFlow.scss'

import { nodes as initialNodes, edges as initialEdges } from '../constant/initial-elements';

const OverviewFlow = () => {
    const [inputData, setInputData] = useState({
        newNodeName: '',
        editNodeName: ''
    });
    // 當前點擊的node
    const [activeNode, setActiveNode] = useState();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [mermaidCode, setMermaidCode] = useState('');
    // 所有node, edge, viewport
    const [reactFlowInstance, setReactFlowInstance] = useState();
    const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

    const onInit = (reactFlowInstance) => {
        setReactFlowInstance(reactFlowInstance);
    };

    useEffect(() => {
        if (activeNode) setInputData({ ...inputData, editNodeName: activeNode.data.label });
    }, [activeNode]);

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
            mermaidCode += `\n  ${edge.source}(${nodeMap[edge.source].data.label}) --> ${edge.target}(${nodeMap[edge.target].data.label})`;
        })
        // 將孤兒特別畫出來 (沒有連線的node)
        nodes.forEach(node => {
            if (!nodeMap[node.id]) {
                mermaidCode += `\n  ${node.id}(${node.data.label})`;
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
    }

    /**
     * 更新node文字
     */
    const editNodeHandler = () => {
        if (!activeNode) return;
        setNodes(nodes => nodes.map(node => {
            if (node.id === activeNode.id) {
                node.data = {
                    ...node.data,
                    label: inputData.editNodeName
                }
            }
            return node;
        }));
        setInputData({
            ...inputData,
            editNodeName: ''
        })
        setActiveNode(null);
    }

    /**
     * input change handler
     */
    const handleInputChange = (event) => {
        const target = event.target;
        setInputData({
            ...inputData,
            [target.name]: target.value
        });
    }

    /**
     * 當點擊node
     */
    const clickHandler = (e) => {
        // 獲取node的id
        var htmlString = e.target.outerHTML.toString();
        var index = htmlString.indexOf(`data-id="`);
        index += 9;
        const currentId = htmlString.substr(index, 13);
        const currentNodeIndex = reactFlowInstance.getNodes().findIndex(node => node.id === currentId);
        if (currentNodeIndex >= 0) {
            setActiveNode(reactFlowInstance.getNodes()[currentNodeIndex]);
        }
    };

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
                            onClick={clickHandler}
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
                            <input name="editNodeName" type="text" value={inputData.editNodeName} onChange={handleInputChange} />
                            <button onClick={editNodeHandler}>更新節點</button><br />
                        </div>
                        <button className="export-btn" onClick={exportMermaidHandler}>導出</button>
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
