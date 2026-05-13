type Props = {
  label: string;
  value: React.ReactNode;
};

export function StatCard({ label, value }: Props) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex justify-center">{value}</div>
    </div>
  );
}
