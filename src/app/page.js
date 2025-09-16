"use client"
import { useState, useMemo, useEffect } from 'react';
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
const TABS = ['Draft', 'PendingDoc', 'Pending/Approval', 'Approved', 'Closed'];


const getAllCreditMemos = async () => {
  const response = await axios.get('http://192.168.0.21:7500/api/creditMemos');
  console.log(response.data);
  return response.data;
}

const getCreditmemosByStatus = async (status, term, sortField, sortDirection) => {
  const response = await axios.get(`http://192.168.0.21:7500/api/creditMemos/query?status=${status}&term=${term || ''}&sortField=${sortField}&sortDirection=${sortDirection}`);
  return response.data;
}

export default function CreditMemosPage() {
  const [activeTab, setActiveTab] = useState('PendingDoc');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortField, setSortField] = useState('Credit_Memo_Number');
  const [filteredData, setFilteredData] = useState();
  const { data, isLoading, error } = useQuery({
    queryKey: ['creditmemos'],
    queryFn: getAllCreditMemos,
  })
  const { data: memos, isLoading: memosLoading, error: memosError } = useQuery({
    queryKey: ['creditmemos', activeTab, searchTerm, sortField, sortDirection],
    queryFn: () => getCreditmemosByStatus(activeTab, searchTerm, sortField, sortDirection),
    enabled: !!activeTab,
  })
  console.log("There are memos:", memos);
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
        invoice: memo.Bobak_Invoice_Number,
        date: memo.CreatedTimestamp?.slice(0, 10),
        deduction: memo.PaidType,
        amount: memo.RequestedAmount ? `$${memo.RequestedAmount.toFixed(2)}` : '$0.00',
      });
      //console.log(acc)
      return acc;
    }, {});
  }, [data]);

  useEffect(() => {
    if (!searchTerm) return;
    const filtered = Object.keys(groupedData).reduce((acc, key) => {
      acc[key] = groupedData[key].filter(item =>
        item.store?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return acc;
    }, {});
    setFilteredData(filtered);
    console.log(filtered)
  }, [searchTerm]);

  return (
    <div className={styles.container}>
      <TopBar setSearchTerm={setSearchTerm} searchTerm={searchTerm} activeTab={activeTab} />
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
      <CreditMemoTable sortField={sortField} setSortField={setSortField} sortDirection={sortDirection} setSortDirection={setSortDirection} data={memos} memosLoading={memosLoading} memosError={memosError} />

    </div>
  );
}
