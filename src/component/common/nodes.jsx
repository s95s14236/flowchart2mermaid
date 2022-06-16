import { Handle } from "react-flow-renderer";
import "../../style/nodes.scss";

const RectangleNode = ({ data }) => {
  return (
    <div style={{ background: "#9ca8b3", padding: "14px" }}>
      <Handle
        type="target"
        position="left"
        id={`${data.id}.left`}
        style={{ borderRadius: 0 }}
      />
      <div id={data.id}>{data.label}</div>
      <Handle
        type="source"
        position="right"
        id={`${data.id}.right1`}
        style={{ top: "30%", borderRadius: 0 }}
      />
      <Handle
        type="source"
        position="right"
        id={`${data.id}.right2`}
        style={{ top: "70%", borderRadius: 0 }}
      />
    </div>
  );
};

const CircleNode = ({ data }) => {
  return (
    <div className="circle">
      <Handle
        type="target"
        position="top"
        id={`${data.id}.top`}
        style={{ zIndex: 1 }}
      />
      <div id={data.id} className="circle-node-text">{data.label}</div>
      <Handle
        type="source"
        position="bottom"
        id={`${data.id}.bottom`}
        style={{ zIndex: 1 }}
      />
    </div>
  );
};

const TriangleNode = ({ data }) => {
  return (
    <div className="triangle-node">
      <Handle
        type="target"
        position="top"
        id={`${data.id}.top`}
        style={{ borderRadius: 0, zIndex: 1 }}
      />
      <div id={data.id} className="triangle-node-text">
        {data.label}
      </div>
      <Handle
        type="source"
        position="bottom"
        id={`${data.id}.bottom1`}
        style={{ left: "30%", borderRadius: 0, zIndex: 1 }}
      />
      <Handle
        type="source"
        position="bottom"
        id={`${data.id}.bottom2`}
        style={{ left: "70%", borderRadius: 0, zIndex: 1 }}
      />
    </div>
  );
};

const RhombusNode = ({ data }) => {
  return (
    <div>
      <Handle
        type="target"
        position="top"
        id={`${data.id}.top`}
        style={{ top: "23%", zIndex: 1 }}
      />
      <div id={data.id} className="rhombus-node-text">
        {data.label}
      </div>
      <div className="diamond"></div>
      <Handle
        type="source"
        position="bottom"
        id={`${data.id}.bottom`}
        style={{ bottom: "-15%", zIndex: 1 }}
      />
    </div>
  );
};

export const nodeTypes = {
  circle: CircleNode,
  rectangle: RectangleNode,
  triangle: TriangleNode,
  rhombus: RhombusNode
}
