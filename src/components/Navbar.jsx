import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Bobak Credit Memos</div>
      <ul className={styles.navLinks}>
        <li><a href="/">Dashboard</a></li>
        <li><a href="#">Credit Memos</a></li>
        <li><a href="#">Reports</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </nav>
  );
}
