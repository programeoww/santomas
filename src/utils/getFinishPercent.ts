export default function getFinishPercent(current: number | string | undefined, total: number | string | undefined) {
  const percent = Math.round((Number(current) / Number(total)) * 100);
  if(isNaN(percent)) return 0;
    return percent;
}