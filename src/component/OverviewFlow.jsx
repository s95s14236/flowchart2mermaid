import React, { useState, useEffect } from 'react';
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
    // 所有node, edge, viewport
    const [reactFlowInstance, setReactFlowInstance] = useState();

    useEffect(() => {
        if (activeNode) setInputData({ ...inputData, editNodeName: activeNode.data.label });
    }, [activeNode]);

    const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

    const onInit = (reactFlowInstance) => {
        console.log('onInit, reactFlowInstance: ', reactFlowInstance);
        setReactFlowInstance(reactFlowInstance);
    };

    const getStateHandler = () => {
        console.log("current state", reactFlowInstance.toObject());
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
                <input name="newNodeName" type="text" value={inputData.newNodeName} onChange={handleInputChange} placeholder='新節點名稱' />
                <button onClick={() => addNodeHandler()}>新增節點</button>
                <button onClick={() => addNodeHandler(true, false)}>新增起始節點</button>
                <button onClick={() => addNodeHandler(false, true)}>新增結尾節點</button> <br />

                <input name="editNodeName" type="text" value={inputData.editNodeName} onChange={handleInputChange} />
                <button onClick={editNodeHandler}>更新節點</button><br />

                <button onClick={getStateHandler}>導出</button>
            </div>
        </>
    );
};

export default OverviewFlow;
