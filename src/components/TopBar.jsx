import axios from 'axios';
import styles from '../styles/CreditMemos.module.css';
import { useRouter } from 'next/navigation'

const printLIst = async (status) => {
  try{
    const response = await axios.get(`http://192.168.0.21:7500/api/creditMemos/print/${status}`, { responseType: 'blob' });
    console.log(response)
  }catch(err){
    console.log(err)
  }
}


export default function TopBar({setSearchTerm, searchTerm,activeTab}) {
   const router = useRouter()

   const handlePrintList = () => {
    printLIst(activeTab);
   }
  return (
    <div className={styles.topBar}>
      <button onClick={() => {router.push("/create")}} className={styles.primaryBtn}>+ Add</button>
      <input className={styles.searchInput} type="text" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
      <div className={styles.actions}>
        <button className={styles.secondaryBtn}>Import to Excel</button>
        <button onClick={handlePrintList} className={styles.secondaryBtn}>Print List</button>
      </div>
    </div>
  );
}
