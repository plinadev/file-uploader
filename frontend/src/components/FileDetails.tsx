/* eslint-disable @typescript-eslint/no-explicit-any */
import document from "../assets/document.svg";

export function FileDetails({ file, onRemove, onChooseNew, formatSize }: any) {
  return (
    <div className="space-y-4">
      <img src={document} alt="document" className="w-20 m-auto" />
      <div className="bg-success/10 p-4 rounded-lg mt-5">
        <p className="font-semibold text-emerald-500 mb-2">
          File Selected Successfully!
        </p>
        <div className="text-sm space-y-1">
          <p>
            <strong>Name:</strong> {file.name}
          </p>
          <p>
            <strong>Size:</strong> {formatSize(file.size)}
          </p>
        </div>
        <div className="mt-4 space-x-2">
          <button className="btn btn-error btn-sm" onClick={onRemove}>
            Remove File
          </button>
          <button className="btn btn-primary btn-sm" onClick={onChooseNew}>
            Choose Different File
          </button>
        </div>
      </div>
    </div>
  );
}
