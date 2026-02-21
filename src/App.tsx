import LuckyDraw from './components/LuckyDraw';

const SAMPLE_NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "Diana Prince",
  "Evan Wright",
  "Fiona Gallagher",
  "George Miller",
  "Hannah Abbott",
  "Ian Malcolm",
  "Julia Stiles"
];

export default function App() {
  return (
    <LuckyDraw initialNames={SAMPLE_NAMES} />
  );
}
