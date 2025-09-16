"use client"
import React, { useState } from 'react';
import { useParams } from 'next/navigation'
import styles from '../../../styles/CreditMemoDetail.module.css';
import { IconBuildingStore, IconCalendarEvent, IconCash, IconCheck, IconFileInvoice, IconMessageCircle, IconNote, IconPaperclip, IconUser, IconUserDollar } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query'
import axios from 'axios';

const getCreditMemoByUUID = async (uuid) => {
  console.log("function hit")
  const response = await axios.get(`http://192.168.0.21:7500/api/creditMemos/${uuid}`)
  console.log("this is memo",response.data)
  return response.data;
}

export default function CreditMemoDetail () {
  const [newComment, setNewComment] = useState('');
  const params = useParams()
   const {uuid} = params;
  console.log(params)
  console.log("this is uuid",uuid)
    const { data, isLoading, error } = useQuery({
        queryKey: ['memo', uuid],
        queryFn: () => getCreditMemoByUUID(uuid),
        enabled: !!uuid // prevents running if id is undefined
    });
    console.log(data)
  // Mock data - in real app this would come from props/API
  const memo = {
    CustomerCode: "CUST001",
    CustomerName: "Sam's Club Distribution Center",
    SalesPerson: "John Smith",
    Credit_Memo_Number: "CM-2024-001",
    BrokerCreditMemo: "BCM-789456",
    Bobak_Invoice_Number: "INV-123789",
    RequestedAmount: "$2,450.00",
    PaidAmount: "$2,450.00",
    PaidType: "Credit Applied",
    PickedUP: "Yes",
    PutInInventory: "No",
    StartingDate: "2024-05-01",
    EndingDate: "2024-05-31",
    Status: "Approved",
    CreatedBy: "Jane Williams",
    CreatedTimestamp: "2024-05-10T10:30:00Z",
    LastModifiedBy: "Mike Johnson",
    ModificationTimestamp: "2024-05-12T14:22:00Z"
  };

  const sampleComments = [
    { author: "Jane Doe", timestamp: "2024-05-10", text: "Please verify the requested amount with accounting.", avatar: "JD" },
    { author: "Michael D.", timestamp: "2024-05-11", text: "Documentation uploaded for Sam's Club return.", avatar: "MD" },
    { author: "A. Smith", timestamp: "2024-05-12", text: "Confirmed with the broker. Memo can proceed to approval.", avatar: "AS" }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <IconCheck size={16} />;
      case 'Pending': return <IconClock size={16} />;
       case 'Closed': return <IconClock size={16} />;
      default: return <IconEdit size={16} />;
    
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Handle comment submission
      setNewComment('');
    }
  };
  if(isLoading){
    return <div className={styles.spinner}></div>
  }
  return (
    <div className={styles.container}>
      {/* Modern Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
                <IconFileInvoice size={24} />

            </div>
            <div className={styles.headerText}>
              <h1 className={styles.headerTitle}>Credit Memo {data.Credit_Memo_Number}</h1>
              <p className={styles.headerSubtitle}>{data.CustomerName}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={`${styles.statusBadge} ${styles[data.Status.toLowerCase()]}`}>
              {getStatusIcon(memo.Status)}
              <span>{data.Status}</span>
            </div>
            <button className={styles.exportBtn}>
              <IconFileInvoice size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

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
                    Customer Code
                  </label>
                  <span className={styles.infoValue}>{data.CustomerCode}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>
                    <IconUser size={16} />
                    Salesperson
                  </label>
                  <span className={styles.infoValue}>{data.SalesPerson}</span>
                </div>
              </div>
              <div className={styles.customerNameHighlight}>
               <IconBuildingStore size={18} />
                <span>{data.CustomerName}</span>
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
                      <span className={styles.infoValue}>{data.Credit_Memo_Number}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                       <IconFileInvoice size={16} />
                        Broker Credit Memo #
                      </label>
                      <span className={styles.infoValue}>{data.BrokerCreditMemo}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                       <IconFileInvoice size={16} />
                        Bobak Reference #
                      </label>
                      <span className={styles.infoValue}>{data.Bobak_Invoice_Number}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Financial Information</h3>
                  <div className={styles.financialGrid}>
                    <div className={styles.amountCard}>
                      <IconCash size={20} className={styles.amountIcon} />
                    
                      <div>
                        <label className={styles.amountLabel}>Requested Amount</label>
                        <span className={styles.amountValue}>{data.RequestedAmount}</span>
                      </div>
                    </div>
                    <div className={styles.amountCard}>
                <IconUserDollar size={20} className={styles.amountIcon} />
              
                      <div>
                        <label className={styles.amountLabel}>Paid Amount</label>
                        <span className={styles.amountValue}>{data.PaidAmount}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <label className={styles.infoLabel}>
                <IconUserDollar size={16} />
                      Payment Type
                    </label>
                    <span className={styles.infoValue}>{data.PaidType}</span>
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
                      <span className={`${styles.infoValue} ${styles.yesValue}`}>{data.PickedUP != null ? data.PickedUP : "not available"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconNote size={16} />
                        Put In Inventory
                      </label>
                      <span className={`${styles.infoValue} ${styles.noValue}`}>{data.PutInInventory != null ? data.PutInInventory : "not available"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                        <IconCalendarEvent size={16} />
                        Promo Start Date
                      </label>
                      <span className={styles.infoValue}>{data.StartingDate != null ? data.StartingDate : "not available"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label className={styles.infoLabel}>
                      <IconCalendarEvent size={16} />
                      
                        Promo End Date
                      </label>
                      <span className={styles.infoValue}>{data.EndingDate != null ? data.EndingDate : "not available"}</span>
                    </div>
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
              <div className={styles.emptyState}>
               <IconPaperclip size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No attachments uploaded yet</p>
                <button className={styles.uploadBtn}>Upload Files</button>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className={styles.metadataCard}>
            <div className={styles.metadataGrid}>
              <div className={styles.metadataItem}>
                <IconUser size={16} />
                <div>
                  <span className={styles.metadataLabel}>Created By</span>
                  <span className={styles.metadataValue}>{data.CreatedBy}</span>
                </div>
              </div>
              <div className={styles.metadataItem}>
               <IconCalendarEvent size={16} />
                <div>
                  <span className={styles.metadataLabel}>Created</span>
                  <span className={styles.metadataValue}>{data.CreatedTimestamp?.slice(0, 10)}</span>
                </div>
              </div>
              <div className={styles.metadataItem}>
               <IconUser size={16} />
             
                <div>
                  <span className={styles.metadataLabel}>Modified By</span>
                  <span className={styles.metadataValue}>{data.LastModifiedBy}</span>
                </div>
              </div>
              <div className={styles.metadataItem}>
             <IconCalendarEvent size={16} />
                <div>
                  <span className={styles.metadataLabel}>Modified</span>
                  <span className={styles.metadataValue}>{data.ModificationTimestamp?.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Comments Sidebar */}
        <div className={styles.commentsSidebar}>
          <div className={styles.commentsHeader}>
            <div className={styles.commentsHeaderIcon}>
              <IconMessageCircle size={20} />
            </div>
            <h2 className={styles.commentsTitle}>Comments</h2>
          </div>
          
          <div className={styles.commentsList}>
            {sampleComments.map((comment, index) => (
              <div key={index} className={styles.commentItem}>
                <div className={styles.commentAvatar}>
                  {comment.avatar}
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.author}</span>
                    <span className={styles.commentTime}>{comment.timestamp}</span>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
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
            <button 
              className={styles.commentSubmitBtn}
              onClick={handleCommentSubmit}
            >
         
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};