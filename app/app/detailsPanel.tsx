import { NodeWithChildren } from "@/db/nodes";

type DetailsPanelProps = {
    nodeData: NodeWithChildren | {};
};

export const DetailsPanel = ({ nodeData }: DetailsPanelProps) => {
    const title = 'title' in nodeData ? nodeData.title || '' : '';
    const content = 'content' in nodeData ? nodeData.content || '' : '';

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <p>{content}</p>
        </div>
    );
};