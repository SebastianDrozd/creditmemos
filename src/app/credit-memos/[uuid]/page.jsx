"use client";
import { useEffect, useState } from "react";
import styles from "../../../styles/CreditMemoDetail.module.css";
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconCash,
  IconFileInvoice,
  IconMessageCircle,
  IconNote,
  IconPaperclip,
  IconUser,
  IconUserDollar,
  IconPlus,
  IconX,
  IconSearch
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getCreditMemoByUUID } from "../../../api/creditmemo";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { QueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { ArrowLeft } from "lucide-react";
/* --- tiny api helpers --- */
const getCustomers = async () => {
  const { data } = await axios.get("http://192.168.0.21:7500/api/creditMemos/customers");
  return data;
};
const getProducts = async () => {
  const { data } = await axios.get("http://192.168.0.21:7500/api/creditMemos/products");
  return data;
};
const updateCreditMemo = async (uuid, formData) => {
  const { data } = await axios.put(`http://192.168.0.21:7500/api/creditMemos/${uuid}`, formData);
  return data;
};

const getMemoStatus = async (UUID) => {
  const { data } = await axios.get(`http://192.168.0.21:7500/api/creditMemos/${UUID}/status`);
  return data;
}
/* -------------------------------- */
const createComment = async (uuid, comment) => {
  const { data } = await axios.post(`http://192.168.0.21:7500/api/creditMemos/${uuid}/comment`, comment
  );
  console.log("this is data from create comment", data);
  return data;
}

const getComments = async (UUID) => {
  const { data } = await axios.get(`http://192.168.0.21:7500/api/creditMemos/${UUID}/comments`);
  console.log("this is data from get comments", data);
  return data;
}

const denyCreditMemo = async (uuid) => {
  const { data } = await axios.get(`http://192.168.0.21:7500/api/creditMemos/deny/${uuid}`);
  return data;
}



export default function ViewCreditMemo() {
  const router = useRouter();
  const { uuid } = useParams();
  const queryclient = useQueryClient();
  const genId = () =>
    (typeof window !== "undefined" &&
      window.crypto &&
      typeof window.crypto.randomUUID === "function")
      ? window.crypto.randomUUID()
      : `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  // server data
  const { data: memo, isLoading: memoLoading, error: memoError } = useQuery({
    queryKey: ["creditmemo", uuid],
    queryFn: () => getCreditMemoByUUID(uuid),
    enabled: !!uuid,
  });
  console.log("Loaded memo:", memo);
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: comments } = useQuery({ queryKey: ["comments", uuid], queryFn: () => getComments(uuid) });
  // local editable state
  const [customer, setCustomer] = useState("");
  const [salesPerson, setSalesPerson] = useState("");
  const [creditMemoNumber, setCreditMemoNumber] = useState("");
  const [brokerCreditMemo, setBrokerCreditMemo] = useState("");
  const [bobakReferenceNumber, setBobakReferenceNumber] = useState("");
  const [paymentType, setPaymentType] = useState("Invoice");
  const [requestAmount, setRequestedAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [pickedUp, setPickedUp] = useState("No");
  const [putInInventory, setPutInInventory] = useState("No");
  const [promoStartDate, setPromoStartDate] = useState("");
  const [promoEndDate, setPromoEndDate] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [isInPendingApproval, setIsInPendingApproval] = useState(false);
  const user = "sdrozd@bobak.com"
  // add-product picker
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["allProducts"],
    queryFn: getProducts,
    enabled: showProductPicker,
  });

  // attachments
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // comments (sample only)
  const [newComment, setNewComment] = useState("");
  const sampleComments = [
    { author: "Jane Doe", timestamp: "2024-05-10", text: "Please verify the requested amount with accounting.", avatar: "JD" },
    { author: "Michael D.", timestamp: "2024-05-11", text: "Documentation uploaded for Sam's Club return.", avatar: "MD" },
    { author: "A. Smith", timestamp: "2024-05-12", text: "Confirmed with the broker. Memo can proceed to approval.", avatar: "AS" },
  ];

  // hydrate from server
  useEffect(() => {
    if (!memo) return;
    setCustomer(memo.CustomerName || "");
    setSalesPerson(memo.SalesPerson || "");
    setCreditMemoNumber(memo.Credit_Memo_Number || "");
    setBrokerCreditMemo(memo.BrokerCreditMemo || "");
    setBobakReferenceNumber(memo.Bobak_Invoice_Number || "");
    setPaymentType(memo.PaidType || "Invoice");
    setRequestedAmount(memo.RequestedAmount ?? "");
    setPaidAmount(memo.PaidAmount ?? "");
    setPickedUp(memo.PickedUP || "No");
    setPutInInventory(memo.PutInInventory || "No");
    setPromoStartDate(memo.StartingDate ? memo.StartingDate.slice(0, 10) : "");
    setPromoEndDate(memo.EndingDate ? memo.EndingDate.slice(0, 10) : "");
    setProducts(memo.Products || []);
    setExistingAttachments(memo.Attachments || []);
    setAttachmentsToDelete([]);
    setStatus(memo.Status || "");
    setIsInPendingApproval(memo.Status == "Pending/Approval");
  }, [memo]);

  // helpers
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCommentSubmit = () => {
    const comment = {
      Body: newComment,
      User: user
    }
    createCommenntMutation.mutate(comment);
  };

  // product edits
  const handleProductUnitChange = (val, index) => {
    const copy = [...products];
    copy[index] = { ...copy[index], ProductUnit: val };
    setProducts(copy);
  };
  const handleProductPriceChange = (val, index) => {
    const copy = [...products];
    copy[index] = { ...copy[index], ProductPrice: val };
    setProducts(copy);
  };
  const handleProductExplanationChange = (val, index) => {
    const copy = [...products];
    copy[index] = { ...copy[index], ProductExplanation: val };
    setProducts(copy);
  };
  const handleDeleteProduct = (productToDelete) => {
    setProducts((prev) => prev.filter((p) => p !== productToDelete));
  };

  // add-product: normalize and push
  const addProductFromPicker = (raw) => {
    const normalized = {
      ProductCode: raw.ProductCode,
      ProductDescription: raw.Description1 ?? raw.ProductDescription ?? "",
      ProductUnit: raw.Units ?? raw.ProductUnit ?? "",
      ProductPrice: raw.Price ?? raw.ProductPrice ?? "",
      ProductExplanation: raw.Explanation ?? raw.ProductExplanation ?? "",
    };
    setProducts((prev) => [...prev, normalized]);
    setShowProductPicker(false);
    setProductSearch("");
  };

  // attachments (local only until Save)
  const handleLocalFileAdd = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const items = files.map((file) => ({
      id: genId(), // generate a unique ID for each
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewFiles((prev) => [...prev, ...items]);
  };
  const removeNewFile = (id) => {
    setNewFiles((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };
  const removeExistingAttachment = (attId) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attId));
    setAttachmentsToDelete((prev) => [...prev, attId]);
  };

  // SAVE (PUT multipart)
  const mutation = useMutation({
    mutationFn: (formData) => updateCreditMemo(uuid, formData),
    onSuccess: (data) => {
      console.log("Updated:", data);
      toast.success('Credit memo updated successfully!');
      queryclient.invalidateQueries({ queryKey: ["creditmemo", uuid] });
    },
    onError: (err) => {
      console.error("Update failed:", err);
      toast.error('Failed to update credit memo.');
    },
  });

  const handleSave = (e) => {
    const statusBtn = e.target.value;
    //const status = statusBtn === "Submit" ? "PendingDoc" : "Draft";

    const normalizedProducts = (products || []).map((p) => ({
      ProductCode: p.ProductCode,
      ProductDescription: p.ProductDescription ?? p.Description1 ?? "",
      ProductUnit: p.ProductUnit ?? p.Units ?? null,
      ProductPrice: p.ProductPrice ?? p.Price ?? null,
      ProductExplanation: p.ProductExplanation ?? p.Explanation ?? null,
    }));

    if (bobakReferenceNumber != "") {
      setStatus("Closed")
    }
    const payload = {
      Status: status,
      CustomerName: customer,
      SalesPerson: salesPerson,
      Credit_Memo_Number: creditMemoNumber,
      BrokerCreditMemo: brokerCreditMemo,
      Bobak_Invoice_Number: bobakReferenceNumber,
      PaidType: paymentType,
      RequestedAmount: requestAmount,
      PaidAmount: paidAmount,
      PickedUP: pickedUp,
      PutInInventory: putInInventory,
      StartingDate: promoStartDate,
      EndingDate: promoEndDate,
      Products: normalizedProducts,
    };
    console.log("this is paylod", payload);
    const fd = new FormData();
    fd.append("payload", JSON.stringify(payload));
    fd.append("deleteAttachmentIds", JSON.stringify(attachmentsToDelete || []));
    newFiles.forEach((f) => fd.append("files", f.file, f.name));

    mutation.mutate(fd);
  };

  // filter for product picker
  const filtered = (allProducts || []).filter((p) => {
    if (!productSearch) return true;
    const s = productSearch.toLowerCase();
    return (
      p.ProductCode?.toLowerCase().includes(s) ||
      p.Description1?.toLowerCase().includes(s)
    );
  });


  const createCommenntMutation = useMutation({
    mutationFn: (comment) => createComment(uuid, comment),
    onSuccess: (data) => {
      console.log("Comment added:", data);
      setNewComment("");
      toast.success('Comment added successfully!');
      queryclient.invalidateQueries({ queryKey: ["comments", uuid] });

    },
    onError: (err) => {
      console.error("Comment failed:", err);
      toast.error('Failed to add comment.');
    },
  });
  const formatTimelineDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    // Example: Tue, Sep 9, 2025 • 11:34 AM
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  const handleDeny = () => {
    denyCreditMemo(uuid).then((data) => {
      console.log("Denied:", data);
      queryclient.invalidateQueries({ queryKey: ["creditmemo", uuid] });
      toast.error('Credit memo denied.');
    }).catch((err) => {
      console.error("Deny failed:", err);
    });
  }
  if (memoLoading) return <Spinner />;
  if (memoError) return <div style={{ padding: 16 }}>Failed to load memo.</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header} />
      <ArrowLeft onClick={() => router.back()} className={styles.arrow} />
      <div className={styles.mainWrapper}>
        <div className={styles.contentArea}>
          {/* Customer Section */}
          <div className={styles.modernCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconBuildingStore size={20} />
              </div>
              <h2 className={styles.cardTitle}>Customer Information</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <IconBuildingStore size={16} />
                    Customer Code <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.selectbox}
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  >
                    {(customers || []).map((c) => (
                      <option key={c.CustomerCode} value={c.Name}>
                        {c.CustomerCode} | {c.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <IconUser size={16} />
                    Salesperson
                  </label>
                  <select
                    className={styles.selectbox}
                    value={salesPerson}
                    onChange={(e) => setSalesPerson(e.target.value)}
                  >
                    <option value="pesposito@bobak.com">pesposito@bobak.com</option>
                    <option value="jhurt@bobak.com">jhurt@bobak.com</option>
                    <option value="sdrozd@bobak.com">sdrozd@bobak.com</option>
                  </select>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <IconMessageCircle size={16} />
                    Status
                  </label>
                  <select
                    className={styles.selectbox}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="PendingDoc">PendingDoc</option>
                    <option value="Pending/Approval">Pending/Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>


              <div className={styles.customerNameHighlight}>
                <IconBuildingStore size={18} />
                <span>{customer}</span>
              </div>
            </div>
          </div>

          {/* Credit Memo Details */}
          <div className={styles.modernCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconFileInvoice size={20} />
              </div>
              <h2 className={styles.cardTitle}>Credit Memo Details</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Reference Numbers</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconFileInvoice size={16} />
                        Credit Memo #
                      </label>
                      <input
                        className={styles.inputfield}
                        value={creditMemoNumber}
                        onChange={(e) => setCreditMemoNumber(e.target.value)}
                      />
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconFileInvoice size={16} />
                        Broker Credit Memo #
                      </label>
                      <input
                        className={styles.inputfield}
                        value={brokerCreditMemo}
                        onChange={(e) => setBrokerCreditMemo(e.target.value)}
                      />
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconFileInvoice size={16} />
                        Bobak Reference #
                      </label>
                      <input
                        className={styles.inputfield}
                        value={bobakReferenceNumber}
                        onChange={(e) => setBobakReferenceNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Financial Information</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconUserDollar size={16} />
                        Payment Type
                      </label>
                      <select
                        className={styles.selectbox}
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                      >
                        <option value="Invoice">Invoice</option>
                        <option value="Deduction">Deduction</option>
                      </select>
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconCash size={20} className={styles.amountIcon} />
                        Requested Amount
                      </label>
                      <input
                        className={styles.inputfield}
                        value={requestAmount}
                        onChange={(e) => setRequestedAmount(e.target.value)}
                      />
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconUserDollar size={20} className={styles.amountIcon} />
                        Paid Amount
                      </label>
                      <input
                        className={styles.inputfield}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Logistics & Timeline</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconNote size={16} />
                        Picked Up
                      </label>
                      <select
                        className={styles.selectbox}
                        value={pickedUp}
                        onChange={(e) => setPickedUp(e.target.value)}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconNote size={16} />
                        Put In Inventory
                      </label>
                      <select
                        className={styles.selectbox}
                        value={putInInventory}
                        onChange={(e) => setPutInInventory(e.target.value)}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconCalendarEvent size={16} />
                        Promo Start Date
                      </label>
                      <input
                        type="date"
                        className={styles.inputfield}
                        value={promoStartDate}
                        onChange={(e) => setPromoStartDate(e.target.value)}
                      />
                    </div>

                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconCalendarEvent size={16} />
                        Promo End Date
                      </label>
                      <input
                        type="date"
                        className={styles.inputfield}
                        value={promoEndDate}
                        onChange={(e) => setPromoEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className={styles.modernCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconFileInvoice size={20} />
              </div>
              <h2 className={styles.cardTitle}>Products</h2>
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => setShowProductPicker(true)}
                style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}
              >
                <IconPlus size={16} /> Add Product
              </button>
            </div>

            <div className={styles.cardContent}>
              {(!products || products.length === 0) ? (
                <div className={styles.emptyState}>
                  <IconFileInvoice size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>No products</p>
                  <button className={styles.uploadBtn} onClick={() => setShowProductPicker(true)}>
                    Select Product
                  </button>
                </div>
              ) : (
                <div className={styles.choosetable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Product Code</th>
                        <th>Description</th>
                        <th>Unit</th>
                        <th>Price</th>
                        <th>Explanation</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, idx) => (
                        <tr key={`${p.ProductCode}-${idx}`}>
                          <td className={styles.tableitem}>{p.ProductCode}</td>
                          <td className={styles.tableitem}>{p.ProductDescription || p.Description1}</td>
                          <td className={styles.tableitem}>
                            <input
                              className={styles.inputfieldunits}
                              value={p.ProductUnit ?? ""}
                              onChange={(e) => handleProductUnitChange(e.target.value, idx)}
                            />
                          </td>
                          <td className={styles.tableitem}>
                            <input
                              className={styles.inputfieldunits}
                              value={p.ProductPrice ?? ""}
                              onChange={(e) => handleProductPriceChange(e.target.value, idx)}
                            />
                          </td>
                          <td className={styles.tableitem}>
                            <input
                              className={styles.inputfield}
                              value={p.ProductExplanation ?? ""}
                              onChange={(e) => handleProductExplanationChange(e.target.value, idx)}
                            />
                          </td>
                          <td>
                            <button className={styles.deletebutton} onClick={() => handleDeleteProduct(p)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button className={styles.uploadBtn} onClick={() => setShowProductPicker(true)} style={{ marginTop: 12 }}>
                    Add Another Product
                  </button>
                </div>
              )}
            </div>
          </div>

          {showProductPicker && (
            <div className={styles.tableOuter2} style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, justifyContent: "flex-end" }}>
                <IconSearch size={18} />
                <input
                  placeholder="Search product code or description..."
                  className={styles.searchbar}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <button type="button" className={styles.deletebutton} onClick={() => setShowProductPicker(false)}>
                  <IconX size={16} /> Close
                </button>
              </div>

              <div className={styles.tablewrap} style={{ maxHeight: 320, overflow: "auto" }}>
                <table className={styles.fullWidthTable}>
                  <thead>
                    <tr>
                      <th>Product Code</th>
                      <th>Product Description</th>
                      <th style={{ width: 120 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading && (
                      <tr><td colSpan={3} className={styles.tableitem}>Loading…</td></tr>
                    )}
                    {!productsLoading && filtered.length === 0 && (
                      <tr><td colSpan={3} className={styles.tableitem}>No matches</td></tr>
                    )}
                    {!productsLoading && filtered.map((prod) => (
                      <tr key={prod.ProductCode}>
                        <td className={styles.tableitem}>{prod.ProductCode?.trim()}</td>
                        <td className={styles.tableitem}>{prod.Description1}</td>
                        <td className={styles.tableitem}>
                          <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => addProductFromPicker(prod)}
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* Attachments */}
          <div className={styles.modernCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconPaperclip size={20} />
              </div>
              <h2 className={styles.cardTitle}>Attachments & Documentation</h2>
            </div>
            <div className={styles.cardContent}>
              {existingAttachments.length > 0 && (
                <div className={styles.uploadList}>
                  {existingAttachments.map((a) => (
                    <div key={a.id} className={styles.uploadItem}>
                      <div className={styles.uploadThumb}>
                        <div className={styles.genericIcon}>📄</div>
                      </div>
                      <div className={styles.uploadMeta}>
                        <div className={styles.uploadName}>{a.OriginalName}</div>
                        <div className={styles.uploadActions}>
                          <a href={`http://bobakapps.bobak.local:7500${a.PublicUrl}`} target="_blank" rel="noreferrer" className={styles.linkBtn}>
                            View
                          </a>
                          <button type="button" className={styles.removeBtn} onClick={() => removeExistingAttachment(a.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {newFiles.length > 0 && (
                <div className={styles.uploadList}>
                  {newFiles.map((f) => (
                    <div key={f.id} className={styles.uploadItem}>
                      <div className={styles.uploadThumb}>
                        {f.type.startsWith("image/") ? (
                          <img src={f.previewUrl} alt={f.name} />
                        ) : f.type === "application/pdf" ? (
                          <iframe src={f.previewUrl} title={f.name} />
                        ) : (
                          <div className={styles.genericIcon}>📄</div>
                        )}
                      </div>
                      <div className={styles.uploadMeta}>
                        <div className={styles.uploadName}>{f.name}</div>
                        <div className={styles.uploadSub}>
                          <span>{formatSize(f.size)}</span>
                        </div>
                        <div className={styles.uploadActions}>
                          <button type="button" className={styles.removeBtn} onClick={() => removeNewFile(f.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {existingAttachments.length === 0 && newFiles.length === 0 && (
                <div className={styles.emptyState}>
                  <IconPaperclip size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>No attachments</p>
                </div>
              )}

              <input type="file" multiple onChange={(e) => handleLocalFileAdd(e.target.files)} className={styles.uploadInput} />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.btnrow}>
            <button className={styles.submitbtn} value="Submit" type="button" onClick={handleSave}>
              Submit
            </button>
            {isInPendingApproval && (
              <button className={styles.denyButton} value="Approve" type="button" onClick={handleDeny}>
                Deny
              </button>
            )}
            {memo?.Status === "Draft" && (
              <button className={styles.draftbtn} value="SaveDraft" type="button">
                Save Draft
              </button>
            )}
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className={styles.commentsSidebar}>
          <div className={styles.commentsHeader}>
            <div className={styles.commentsHeaderIcon}>
              <IconMessageCircle size={20} />
            </div>
            <h2 className={styles.commentsTitle}>Comments</h2>
          </div>

          <div className={styles.commentsList}>
            {comments && comments.map((c, i) => (
              <div key={i} className={styles.commentItem}>
                <div className={styles.commentAvatar}>{c.CommentUser.substring(0, 1)}</div>
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{c.CommentUser}</span>
                    <span className={styles.commentTime}>{new Date(c.CommentDate).toISOString().split("T")[0]}</span>
                  </div>
                  <p className={styles.commentText}>{c.CommentBody}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.commentInput}>
            <textarea
              className={styles.commentTextarea}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
            />
            <button className={styles.commentSubmitBtn} onClick={handleCommentSubmit}>
              Post Comment
            </button>
          </div>
          <div className={styles.timelineSection}>
            <h3 className={styles.sectionTitle}>Activity Timeline</h3>

            {!memo?.Statuses?.length ? (
              <div className={styles.timelineEmpty}>No activity yet</div>
            ) : (
              <ol className={styles.timeline} aria-label="Activity timeline">
                {memo.Statuses.map((status, i) => (
                  <li key={i} className={styles.timelineItem}>
                    <div className={styles.timelineMarker} aria-hidden="true" />
                    <div className={styles.timelineCard}>
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineUser}>{status.StatusUser.split('@')[0] || "Unknown"}</span>
                        <time className={styles.timelineDate} dateTime={status.StatusDate}>
                          {formatTimelineDate(status.StatusDate)}
                        </time>
                      </div>
                      <p className={styles.timelineBody}>{status.StatusDesc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

        </div>

      </div>
      <Toaster />
    </div>
  );
}
