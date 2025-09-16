"use client";
import { useEffect, useState } from "react";
import styles from "../../styles/CreateCreditMemo.module.css";
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
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { saveCreditMemo } from "../../api/creditmemo";
import Spinner from "@/components/Spinner";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";

/* Helpers */
const genId = () =>
(typeof window !== "undefined" &&
  window.crypto &&
  typeof window.crypto.randomUUID === "function"
  ? window.crypto.randomUUID()
  : `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

const getCustomers = async () => {
  const response = await axios.get(
    "http://192.168.0.21:7500/api/creditMemos/customers"
  );
  return response.data;
};

const getProducts = async () => {
  const response = await axios.get(
    "http://192.168.0.21:7500/api/creditMemos/products"
  );
  return response.data;
};

export default function CreateCreditMemo() {
  const router = useRouter();

  // toggles for fetching lists
  const [wantsCustomers, setWantsCustomers] = useState(false);
  const [wantsProducts, setWantsProducts] = useState(false);

  // server data
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
    enabled: wantsCustomers,
  });

  const { data: canopyProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: wantsProducts,
  });
  
  // form fields
  const [customer, setCustomer] = useState(null);
  const [chosenCustomer, setChosenCustomer] = useState("");
  const [salesPerson, setSalesPerson] = useState("");

  const [creditMemoNumber, setCreditMemoNumber] = useState(null);
  const [brokerCreditMemo, setBrokerCreditMemo] = useState(null);
  const [bobakReferenceNumber, setBobakReferenceNumber] = useState(null);

  const [paymentType, setPaymentType] = useState(null);
  const [requestAmount, setRequestedAmount] = useState(null);
  const [paidAmount, setPaidAmount] = useState(null);

  const [pickedUp, setPickedUp] = useState("Yes");
  const [putInInventory, setPutInInventory] = useState(null);
  const [promoStartDate, setPromoStartDate] = useState(null);
  const [promoEndDate, setPromoEndDate] = useState(null);

  const [desciprtion, setDescription] = useState(null); // keeping your original key
  const [products, setProducts] = useState([]);

  // attachments
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // cleanup previews
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [uploadedFiles]);

  /* ---- mutations ---- */
  const handleSaveMutation = useMutation({
    mutationFn: (newMemo) => saveCreditMemo(newMemo),
    onSuccess: (data) => {
      toast.success("Successfully created credit memo", {
        duration: 3000,
        position: "top-center",
        style: { border: "1px solid #4ade80" },
      });
      setTimeout(() => {
        router.push(`/`);
      }, 4000);
    },
    onError: () => {
      toast.error("Error creating credit memo", {
        duration: 3000,
        position: "top-center",
        style: { border: "1px solid #dc2626" },
      });
    },
  });

  /* ---- handlers ---- */
  const handleChooseCustomer = (val) => {
    setCustomer(val);
    setChosenCustomer(val);
  };

  const handleChoosePaymentType = (val) => setPaymentType(val);
  const handleChoosePickedUp = (val) => setPickedUp(val);
  const handleChoosePutInInventory = (val) => setPutInInventory(val);

  const handleChooseProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
    setWantsProducts(false);
  };

  const handleDeleteProduct = (productToDelete) => {
    setProducts((prev) => prev.filter((p) => p !== productToDelete));
  };

  const handleProductUnitChange = (val, index) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[index].Units = val;
      return copy;
    });
  };
  const handleProductPriceChange = (val, index) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[index].Price = val;
      return copy;
    });
  };
  const handleProductDescriptionChange = (val, index) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[index].Explanation = val;
      return copy;
    });
  };

  const handleUpload = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const newItems = files.map((file) => ({
      id: genId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    }));
    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e) => {
    const statusBtn = e.target.value;
    const status = statusBtn === "Submit" ? "PendingDoc" : "Draft";

    const payload = {
      Status: status,
      CustomerName: customer,
      SalesPerson: salesPerson,
      Credit_Memo_Number: creditMemoNumber,
      BrokerCreditMemo: brokerCreditMemo,
      BobakReference: bobakReferenceNumber, // keeping your original key
      PaidType: paymentType,
      RequestedAmount: requestAmount,
      PaidAmount: paidAmount,
      PickedUP: pickedUp,
      PutInInventory: putInInventory,
      StartingDate: promoStartDate,
      EndingDate: promoEndDate,
      Products: products,
      Description: desciprtion,
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    uploadedFiles.forEach((f) => formData.append("files", f.file, f.name));

    handleSaveMutation.mutate(formData);
  };
  return (
      <div className="appShell">
                <Sidebar />
                <div className="appContent">
          
                  <main className="mainContainer">
                     <div className={styles.container}>
      {/* Header (kept minimal) */}
      <div className={styles.header}></div>
      <ArrowLeft onClick={() => router.back()} className={styles.arrow} />
      <div className={styles.mainWrapper}>
        <div className={styles.pageGrid}>
          {/* LEFT — MAIN CONTENT */}
          <div className={styles.colMain}>
            {/* Customer Information */}
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
                      onChange={(e) => handleChooseCustomer(e.target.value)}
                      onClick={() => setWantsCustomers(true)}
                      className={styles.selectbox}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {customersLoading ? "Loading…" : "Select a customer"}
                      </option>
                      {!customersLoading &&
                        customers?.map((c) => (
                          <option key={c.CustomerCode} value={c.Name}>
                            {c.CustomerCode} | {c.Name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.infoItem}>
                    <label className={styles.infoLabel}>
                      <IconUser size={16} />
                      Salesperson <span className={styles.required}>*</span>
                    </label>
                    <select
                      onChange={(e) => setSalesPerson(e.target.value)}
                      className={styles.selectbox}
                      value={salesPerson}
                    >
                      <option value="" disabled>Select a salesperson</option>
                      <option>pesposito@bobak.com</option>
                      <option>jhurt@bobak.com</option>
                      <option>sdrozd@bobak.com</option>
                    </select>
                  </div>
                </div>

                <div className={styles.customerNameHighlight}>
                  <IconBuildingStore size={18} />
                  <span>{chosenCustomer || "No customer selected"}</span>
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
                          onChange={(e) => setCreditMemoNumber(e.target.value)}
                        />
                      </div>

                      <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>
                          <IconFileInvoice size={16} />
                          Broker Credit Memo #{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <input
                          className={styles.inputfield}
                          onChange={(e) => setBrokerCreditMemo(e.target.value)}
                        />
                      </div>

                      <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>
                          <IconFileInvoice size={16} />
                          Bobak Reference #
                        </label>
                        <input
                          disabled
                          className={styles.inputfield}
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
                          Payment Type <span className={styles.required}>*</span>
                        </label>
                        <select
                          onChange={(e) => handleChoosePaymentType(e.target.value)}
                          className={styles.selectbox2}
                          defaultValue="Invoice"
                        >
                          <option value="Invoice">Invoice</option>
                          <option value="Deduction">Deduction</option>
                        </select>
                      </div>

                      <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>
                          <IconCash size={20} className={styles.amountIcon} />
                          Requested Amount{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <input
                          className={styles.inputfield}
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
                          Picked Up <span className={styles.required}>*</span>
                        </label>
                        <select
                          onChange={(e) => handleChoosePickedUp(e.target.value)}
                          className={styles.selectbox}
                          value={pickedUp}
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
                          onChange={(e) =>
                            handleChoosePutInInventory(e.target.value)
                          }
                          className={styles.selectbox}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px" }}>
                      <div className={styles.infoItem}>
                        <label className={styles.infoLabel}>
                          <IconCalendarEvent size={16} />
                          Promo Start Date
                        </label>
                        <input
                          type="date"
                          className={styles.inputfield}
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
                          onChange={(e) => setPromoEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.messagecont}>
                      <h3 className={styles.sectionTitle}>Credit Memo Description</h3>
                      <textarea
                        className={styles.textarea}
                        placeholder="Enter a brief description or notes about the credit memo..."
                        onChange={(e) => setDescription(e.target.value)}
                      />
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
              </div>

              <div className={styles.cardContent}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailSection}>
                    <div className={styles.topwrapper}>
                      <h3 className={styles.sectionTitle2}>Product Information</h3>
                      {wantsProducts && (
                        <input
                          className={styles.searchbar}
                          placeholder="Search (optional)"
                          onChange={() => { }}
                        />
                      )}
                    </div>

                    <div className={styles.infoGrid}>
                      {products.length === 0 && !wantsProducts && (
                        <div className={styles.emptyState}>
                          <IconFileInvoice size={48} className={styles.emptyIcon} />
                          <p className={styles.emptyText}>No products selected</p>
                          <button
                            onClick={() => setWantsProducts(true)}
                            className={styles.uploadBtn}
                          >
                            Select Product
                          </button>
                        </div>
                      )}

                      {products.length > 0 && !wantsProducts && (
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
                              {products.map((product, index) => (
                                <tr key={`${product.ProductCode}-${index}`}>
                                  <td className={styles.tableitem}>
                                    {product.ProductCode}
                                  </td>
                                  <td className={styles.tableitem}>
                                    {product.Description1}
                                  </td>
                                  <td className={styles.tableitem}>
                                    <input
                                      value={product.Units || ""}
                                      className={styles.inputfieldunits}
                                      onChange={(e) =>
                                        handleProductUnitChange(e.target.value, index)
                                      }
                                    />
                                  </td>
                                  <td className={styles.tableitem}>
                                    <input
                                      value={product.Price || ""}
                                      className={styles.inputfieldunits}
                                      onChange={(e) =>
                                        handleProductPriceChange(e.target.value, index)
                                      }
                                    />
                                  </td>
                                  <td className={styles.tableitem}>
                                    <input
                                      value={product.Explanation || ""}
                                      className={styles.inputfield}
                                      onChange={(e) =>
                                        handleProductDescriptionChange(
                                          e.target.value,
                                          index
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => handleDeleteProduct(product)}
                                      className={styles.deletebutton}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <button
                            onClick={() => setWantsProducts(true)}
                            className={styles.uploadBtn}
                            style={{ marginTop: 10 }}
                          >
                            Select Product
                          </button>
                        </div>
                      )}

                      {wantsProducts && (
                        <div className={styles.tableOuter}>
                          {productsLoading ? (
                            <div style={{ padding: 12 }}>
                              <Spinner />
                            </div>
                          ) : (
                            <table className={styles.tablewrap}>
                              <thead>
                                <tr>
                                  <th>Product Code</th>
                                  <th>Product Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {canopyProducts?.map((product) => (
                                  <tr
                                    key={product.ProductCode}
                                    className={styles.tableRow}
                                    onClick={() => handleChooseProduct(product)}
                                  >
                                    <td className={styles.tableitem}>
                                      {product?.ProductCode?.trim()}
                                    </td>
                                    <td className={styles.tableitem}>
                                      {product?.Description1}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className={styles.modernCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderIcon}>
                  <IconPaperclip size={20} />
                </div>
                <h2 className={styles.cardTitle}>Attachments & Documentation</h2>
              </div>

              <div className={styles.cardContent}>
                {uploadedFiles.length > 0 ? (
                  <div className={styles.uploadList}>
                    {uploadedFiles.map((f) => (
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
                            <a
                              href={f.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.linkBtn}
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(f.id)}
                              className={styles.removeBtn}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <IconPaperclip size={48} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>
                      No attachments uploaded yet
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  onChange={(e) => handleUpload(e.target.files)}
                  className={styles.uploadInput}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — STICKY REVIEW & ACTIONS */}
          <aside className={styles.colSide}>
            <div className={styles.sideCard}>
              <div className={styles.sideHeader}>
                <div className={styles.sideTitle}>Review & Actions</div>
                <div className={styles.sideSub}>Quick summary before submit</div>
              </div>

              <div className={styles.sideContent}>
                <div className={styles.kv}>
                  <span>Customer</span>
                  <strong>{chosenCustomer || "—"}</strong>
                </div>
                <div className={styles.kv}>
                  <span>Salesperson</span>
                  <strong>{salesPerson || "—"}</strong>
                </div>
                <div className={styles.kv}>
                  <span>Payment Type</span>
                  <strong>{paymentType || "—"}</strong>
                </div>
                <div className={styles.kv}>
                  <span>Requested</span>
                  <strong>{requestAmount || "—"}</strong>
                </div>
                <div className={styles.kv}>
                  <span>Products</span>
                  <strong>{products?.length || 0}</strong>
                </div>
                <div className={styles.kv}>
                  <span>Attachments</span>
                  <strong>{uploadedFiles?.length || 0}</strong>
                </div>

                {desciprtion && (
                  <div className={styles.noteBox}>
                    <div className={styles.noteLabel}>Description</div>
                    <div className={styles.noteBody}>{desciprtion}</div>
                  </div>
                )}
              </div>

              <div className={styles.sideActions}>
                <button
                  className={styles.submitbtn}
                  value="Submit"
                  onClick={handleSubmit}
                  disabled={handleSaveMutation.isPending}
                >
                  Submit
                  {handleSaveMutation.isPending && (
                    <div className={styles.btnSpinner} />
                  )}
                </button>

                <button
                  className={styles.draftbtn}
                  value="Draft"
                  onClick={handleSubmit}
                  disabled={handleSaveMutation.isPending}
                >
                  Save as draft
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Toaster />
    </div>
                  </main>
                </div>
              </div>
   
  );
}
