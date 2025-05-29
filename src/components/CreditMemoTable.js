import styles from '../styles/CreditMemos.module.css';
import { useRouter } from 'next/navigation'
export default function CreditMemoTable({ data }) {
    const router = useRouter()

    const handleClick = (uuid) => {
        router.push(`/credit-memos/${uuid}`)
    }
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Credit Memo Number</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Deduction Type</th>
                    <th>Amount</th>
                    <th>Invoice Number</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i} onClick={() => handleClick(row.uuid)} className={styles.clickableRow}>
                        <td>{row.memo}</td>
                        <td>{row.store}</td>
                        <td>{row.date}</td>
                        <td>{row.deduction}</td>
                        <td>{row.amount}</td>
                        <td>{row.invoice}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
