import styles from '../styles/CreditMemos.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <button className={styles.primaryBtn}>+ Add</button>
      <input className={styles.searchInput} type="text" placeholder="Search..." />
      <div className={styles.actions}>
        <button className={styles.secondaryBtn}>Import to Excel</button>
        <button className={styles.secondaryBtn}>Print List</button>
      </div>
    </div>
  );
}
