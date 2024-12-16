import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Votier App" },
    { name: "description", content: "Welcome to Votier!" },
  ];
};

export const candidates = [
  { address: "0x123...", name: "John Doe" },
  { address: "0x456...", name: "Jane Smith" },
  { address: "0x789...", name: "Alice Johnson" },
  { address: "0xabc...", name: "Bob Brown" },
];

export default function Index() {
  return (
    <div className="candidate-list">
      <h2 className="title">Candidate List</h2>
      <ul className="candidate-items">
        {candidates.map((candidate, index) => (
          <li key={index} className="candidate-item">
            <div className="candidate-info">
              <p className="candidate-name">{candidate.name}</p>
              <p className="candidate-address">{candidate.address}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
