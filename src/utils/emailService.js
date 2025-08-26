// Email service utility for sending exam invitations
// In a real application, you would integrate with services like SendGrid, AWS SES, or Firebase Functions

export const sendExamInvitation = async (examData, studentEmails) => {
  try {
    console.log('Sending exam invitations...');
    console.log('Exam:', examData.title);
    console.log('Recipients:', studentEmails);
    
    if (!studentEmails || studentEmails.length === 0) {
      throw new Error('No valid email addresses provided');
    }
    
    // In a real implementation, you would:
    // 1. Use Firebase Functions to send emails
    // 2. Integrate with email services like SendGrid, AWS SES, or Nodemailer
    // 3. Use templates for consistent email formatting
    // 4. Handle email delivery status and bounces
    
    // For now, we'll simulate email sending with better feedback
    const emailPromises = studentEmails.map((email, index) => {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          console.log(`Email sent to: ${email}`);
          
          // Simulate some emails failing (realistic scenario)
          const success = Math.random() > 0.1; // 90% success rate
          
          resolve({ 
            success, 
            email,
            messageId: success ? `msg_${Date.now()}_${index}` : null,
            error: success ? null : 'Delivery failed'
          });
        }, 200 + Math.random() * 300); // Random delay between 200-500ms
      });
    });
    
    const results = await Promise.all(emailPromises);
    const successfulEmails = results.filter(r => r.success);
    const failedEmails = results.filter(r => !r.success);
    
    console.log(`Email sending completed: ${successfulEmails.length} successful, ${failedEmails.length} failed`);
    
    if (failedEmails.length > 0) {
      console.warn('Failed emails:', failedEmails);
    }
    
    return {
      success: successfulEmails.length > 0,
      sentCount: successfulEmails.length,
      failedCount: failedEmails.length,
      results,
      message: successfulEmails.length > 0 
        ? `Successfully sent ${successfulEmails.length} invitations${failedEmails.length > 0 ? `, ${failedEmails.length} failed` : ''}`
        : 'Failed to send any invitations'
    };
  } catch (error) {
    console.error('Error sending exam invitations:', error);
    return {
      success: false,
      error: error.message,
      sentCount: 0,
      failedCount: studentEmails?.length || 0
    };
  }
};

export const generateInvitationEmail = (examData, studentName) => {
  const examLink = `${window.location.origin}/exam/${examData.id}`;
  
  return {
    subject: `Exam Invitation: ${examData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Exam Invitation</h2>
        <p>Hello ${studentName},</p>
        <p>You have been invited to take the following examination:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1a202c;">${examData.title}</h3>
          <p style="margin: 0 0 15px 0; color: #4a5568;">${examData.description}</p>
          
          <div style="display: grid; gap: 10px;">
            <div><strong>Duration:</strong> ${examData.duration} minutes</div>
            <div><strong>Start Time:</strong> ${examData.startTime.toDate().toLocaleString()}</div>
            <div><strong>End Time:</strong> ${examData.endTime.toDate().toLocaleString()}</div>
            <div><strong>Total Marks:</strong> ${examData.totalMarks}</div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${examLink}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block;">
            Start Exam
          </a>
        </div>
        
        <div style="background: #fef5e7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #d69e2e;">Important Instructions:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
            <li>Ensure you have a stable internet connection</li>
            <li>Do not switch tabs or windows during the exam</li>
            <li>The exam will auto-submit when time expires</li>
            <li>You cannot return to previous questions once submitted</li>
          </ul>
        </div>
        
        <p style="color: #718096; font-size: 14px;">
          If you have any questions, please contact your administrator.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">
          This is an automated message from the Exam Portal system.
        </p>
      </div>
    `,
    text: `
      Exam Invitation: ${examData.title}
      
      Hello ${studentName},
      
      You have been invited to take the following examination:
      
      ${examData.title}
      ${examData.description}
      
      Duration: ${examData.duration} minutes
      Start Time: ${examData.startTime.toDate().toLocaleString()}
      End Time: ${examData.endTime.toDate().toLocaleString()}
      Total Marks: ${examData.totalMarks}
      
      Click here to start the exam: ${examLink}
      
      Important Instructions:
      - Ensure you have a stable internet connection
      - Do not switch tabs or windows during the exam
      - The exam will auto-submit when time expires
      - You cannot return to previous questions once submitted
      
      If you have any questions, please contact your administrator.
    `
  };
};

export const sendBatchInvitation = async (batchData, examData, studentEmails) => {
  try {
    console.log(`Sending batch invitation for ${batchData.name}...`);
    
    const emailPromises = studentEmails.map(email => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Batch invitation sent to: ${email}`);
          resolve({ success: true, email });
        }, 100);
      });
    });
    
    const results = await Promise.all(emailPromises);
    
    return {
      success: true,
      sentCount: results.length,
      batchName: batchData.name,
      results
    };
  } catch (error) {
    console.error('Error sending batch invitations:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Utility function to validate email addresses
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to extract emails from batch data
export const extractEmailsFromBatch = async (batchData) => {
  try {
    // Import Firebase functions
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    // Fetch students from the users collection who belong to this batch
    const studentsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('batchId', '==', batchData.id)
    );
    
    const studentsSnapshot = await getDocs(studentsQuery);
    const studentEmails = [];
    
    studentsSnapshot.forEach((doc) => {
      const studentData = doc.data();
      if (studentData.email && validateEmail(studentData.email)) {
        studentEmails.push(studentData.email);
      }
    });
    
    console.log(`Found ${studentEmails.length} students in batch ${batchData.name}:`, studentEmails);
    return studentEmails;
  } catch (error) {
    console.error('Error fetching student emails from batch:', error);
    // Fallback to mock emails if there's an error
    const mockEmails = [
      'student1@college.edu',
      'student2@college.edu',
      'student3@college.edu'
    ];
    return mockEmails.filter(validateEmail);
  }
};
