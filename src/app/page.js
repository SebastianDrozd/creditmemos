"use client"
import { useState,useMemo } from 'react';
import styles from '../styles/CreditMemos.module.css';
import TopBar from '../components/TopBar';
import CreditMemoTable from '../components/CreditMemoTable';
const axios = require('axios');
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
const TABS = ['Draft', 'PendingDoc', 'PendingApproval', 'Approved', 'Closed'];


const getAllCreditMemos = async () => {
  const response = await axios.get('http://192.168.0.21:7500/api/creditMemos');
  console.log(response.data);
  return response.data;
}

export default function CreditMemosPage() {
  const [activeTab, setActiveTab] = useState('PendingDoc');
    const { data, isLoading, error } = useQuery({
    queryKey: ['creditmemos'],
    queryFn: getAllCreditMemos,
  })
 const groupedData = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, memo) => {
      const status = memo.Status;
      if (!acc[status]) acc[status] = [];
      acc[status].push({
        uuid: memo.UUID,
        store: memo.CustomerName,
        memo: memo.Credit_Memo_Number,
        type: memo.Credit_Memo_Number,
        invoice : memo.Bobak_Invoice_Number,
        date: memo.CreatedTimestamp?.slice(0, 10),
        deduction: memo.PaidType,
        amount: memo.RequestedAmount ? `$${memo.RequestedAmount.toFixed(2)}` : '$0.00',
      });
      console.log(acc)
      return acc;
    }, {});
  }, [data]);

  return (
    <div className={styles.container}>
      <TopBar />
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
     <CreditMemoTable data={groupedData[activeTab] ?? []} />

    </div>
  );
}
