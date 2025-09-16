"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../styles/Sidebar.module.css";
import {
  IconLayoutDashboard,
  IconFileText,
  IconReportAnalytics,
  IconSettings,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

const nav = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/credit-memos", label: "Credit Memos", icon: IconFileText },
  { href: "/reports", label: "Reports", icon: IconReportAnalytics },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // load persisted collapsed state
  useEffect(() => {
    const v = localStorage.getItem("sidebar-collapsed");
    if (v === "1") setCollapsed(true);
  }, []);

  // persist + update root attribute so content can shift
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    document.documentElement.setAttribute(
      "data-sidebar",
      collapsed ? "collapsed" : "open"
    );
  }, [collapsed]);

  return (
    <>
      {/* Mobile header bar */}
      <div className={styles.mobileBar}>
        <button className={styles.iconBtn} onClick={() => setOpenMobile(true)}>
          <IconMenu2 size={20} />
        </button>
        <span className={styles.mobileTitle}>Bobak Credit Memos</span>
      </div>

      {/* Mobile overlay */}
      {openMobile && <div className={styles.overlay} onClick={() => setOpenMobile(false)} />}

      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : "",
          openMobile ? styles.openMobile : "",
        ].join(" ")}
      >
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>B</div>
            {!collapsed && <div className={styles.brandText}>Credit Memos</div>}
          </div>

          <div className={styles.topActions}>
            {/* Collapse/expand caret (desktop only) */}
            {!collapsed ? (
              <button className={styles.caretBtn} onClick={() => setCollapsed(true)} title="Collapse">
                ‹
              </button>
            ) : (
              <button className={styles.caretBtn} onClick={() => setCollapsed(false)} title="Expand">
                ›
              </button>
            )}

            {/* Close button (mobile only) */}
            <button className={`${styles.iconBtn} ${styles.closeBtn}`} onClick={() => setOpenMobile(false)}>
              <IconX size={18} />
            </button>
          </div>
        </div>

        <nav className={styles.nav}>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={[styles.link, active ? styles.active : ""].join(" ")}
                onClick={() => setOpenMobile(false)}
              >
                <Icon size={18} className={styles.linkIcon} />
                {!collapsed && <span className={styles.linkText}>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.user}>
            <div className={styles.avatar}>S</div>
            {!collapsed && (
              <div className={styles.userMeta}>
                <div className={styles.userName}>Stella Bobak</div>
                <div className={styles.userEmail}>sdrozd@bobak.com</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
