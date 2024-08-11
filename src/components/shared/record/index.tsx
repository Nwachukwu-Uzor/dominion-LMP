type Props = {
  header: string;
  content?: string | number;
};

export const Record: React.FC<Props> = ({ header, content }) => (
  <div>
    <h3 className="text-gray-400 text-xs font-medium">
      {header.toUpperCase()}:
    </h3>
    <h6 className="text-sm mt-1">{content}</h6>
  </div>
);
