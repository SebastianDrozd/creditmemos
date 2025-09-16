import styles from '../styles/CreditMemos.module.css';
import { useRouter } from 'next/navigation'
import Spinner from './Spinner';
import { ArrowDownUp, SortAsc } from 'lucide-react';
export default function CreditMemoTable({ data, memosLoading, memosError, sortField, setSortField, sortDirection, setSortDirection }) {
    const router = useRouter()

    const handleClick = (uuid) => {
        router.push(`/credit-memos/${uuid}`)
    }
    if (memosLoading) return <Spinner />

    if (memosError) return <div>Error loading data</div>
    console.log("Data in table:", data);

    const handleSortClick = (field) => {
        if (sortField === field) {
            // toggle once
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc'); // or 'desc' if you prefer
        }
    };

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th><div onClick={() => handleSortClick("Credit_Memo_Number")} className={styles.sortableHeader}> Credit Memo Number <ArrowDownUp size={14} /></div></th>
                    <th ><div onClick={() => handleSortClick("CustomerName")} className={styles.sortableHeader}> Customer Name <ArrowDownUp size={14} /></div></th>
                        <th ><div onClick={() => handleSortClick("SalesPerson")} className={styles.sortableHeader}> SalesPerson<ArrowDownUp size={14} /></div></th>
                    <th><div onClick={() => handleSortClick("CreatedTimestamp")} className={styles.sortableHeader}> Date <ArrowDownUp size={14} /></div></th>
                    <th><div onClick={() => handleSortClick("PaidType")} className={styles.sortableHeader}> Deduction Type <ArrowDownUp size={14} /></div></th>
                    <th><div onClick={() => handleSortClick("RequestedAmount")} className={styles.sortableHeader}> Amount <ArrowDownUp size={14} /></div></th>
                    <th><div onClick={() => handleSortClick("Bobak_Invoice_Number")} className={styles.sortableHeader}> Invoice Number <ArrowDownUp size={14} /></div></th>
                </tr>
            </thead>
            <tbody>
                {data && data.map((row, i) => (
                    <tr key={i} onClick={() => handleClick(row.UUID)} className={styles.clickableRow}>
                        <td>{row.Credit_Memo_Number}</td>
                        <td>{row.CustomerName}</td>
                        <td>{row.SalesPerson}</td>
                        <td>{row.CreatedTimestamp?.slice(0, 10)}</td>
                        <td>{row.PaidType}</td>
                        <td>{row.RequestedAmount ? `$${row.RequestedAmount.toFixed(2)}` : '$0.00'}</td>
                        <td>{row.Bobak_Invoice_Number}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
