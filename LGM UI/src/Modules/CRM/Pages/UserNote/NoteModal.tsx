import { useState } from "react";
import MotionWrapper from "../Drive/Modals/MotionWrapper";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, gradient: string) => void;
}

const gradients = [
  { name: "Lavender", class: "from-[#c471f5] to-[#fa71cd]" },
  { name: "Sunset", class: "from-[#ff9966] to-[#ff5e62]" },
  { name: "Sky", class: "from-[#56ccf2] to-[#2f80ed]" },
  { name: "Orange", class: "from-[#ffd66b] to-[#ff9a3c]" },
  { name: "Purple", class: "from-[#7367f0] to-[#ce9ffc]" },
  { name: "Pink", class: "from-[#ff758c] to-[#ff7eb3]" },
  { name: "Aqua", class: "from-[#43cea2] to-[#185a9d]" },
];

const NoteModal = ({ isOpen, onClose, onSave }: NoteModalProps) => {
  const [text, setText] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(gradients[0].class);

  return (
    <MotionWrapper isOpen={isOpen} onClose={onClose}>
      <div className="w-[400px] bg-white rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#133561] mb-4">
          Create New Note
        </h3>
        <textarea
          className="w-full h-32 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your note here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          {gradients.map((g) => (
            <button
              key={g.name}
              onClick={() => setSelectedGradient(g.class)}
              className={`w-8 h-8 rounded-full bg-linear-to-br ${g.class} ${selectedGradient === g.class ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
            />
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(text, selectedGradient);
              setText("");
              onClose();
            }}
            className="px-6 py-2 bg-[#133561] text-white rounded-lg font-bold"
          >
            Save Note
          </button>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default NoteModal;
