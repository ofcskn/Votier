import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Vote Now" },
    { name: "description", content: "Vote for a candidate!" },
  ];
};

export default function Vote() {
  return (
    <h1>Votier</h1>
  );
}
