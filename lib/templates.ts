export const BARANGAY_CLEARANCE_TEMPLATE = `
<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white; color: black;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0; text-transform: uppercase;">Republic of the Philippines</h2>
    <h3 style="margin: 5px 0;">City/Municipality of {{city}}</h3>
    <h3 style="margin: 5px 0;">Barangay {{barangay_name}}</h3>
    <h1 style="margin: 20px 0; text-decoration: underline; font-size: 28px;">BARANGAY CLEARANCE</h1>
  </div>
  
  <div style="line-height: 1.8; font-size: 16px; text-align: justify; margin-bottom: 40px;">
    <p>TO WHOM IT MAY CONCERN:</p>
    
    <p style="text-indent: 40px;">
      This is to certify that <strong>{{full_name}}</strong>, <strong>{{age}}</strong> years old, <strong>{{civil_status}}</strong>, is a bona fide resident of <strong>{{address}}</strong>, and is known to me to be of good moral character and a law-abiding citizen.
    </p>
    
    <p style="text-indent: 40px;">
      This certification is being issued upon the request of the above-named person for the purpose of: <strong>{{purpose}}</strong>.
    </p>
    
    <p style="text-indent: 40px;">
      Given this <strong>{{date}}</strong> at Barangay {{barangay_name}}, City of {{city}}, Philippines.
    </p>
  </div>
  
  <div style="display: flex; justify-content: flex-end; margin-top: 60px;">
    <div style="text-align: center; width: 250px;">
      <div style="border-bottom: 1px solid black; margin-bottom: 5px; height: 30px;"></div>
      <p style="margin: 0; font-weight: bold;">PUNONG BARANGAY</p>
      <p style="margin: 0; font-size: 12px;">(Signature over printed name)</p>
    </div>
  </div>
</div>
`;

export const CERTIFICATE_OF_INDIGENCY_TEMPLATE = `
<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white; color: black;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0; text-transform: uppercase;">Republic of the Philippines</h2>
    <h3 style="margin: 5px 0;">City/Municipality of {{city}}</h3>
    <h3 style="margin: 5px 0;">Barangay {{barangay_name}}</h3>
    <h1 style="margin: 20px 0; text-decoration: underline; font-size: 28px;">CERTIFICATE OF INDIGENCY</h1>
  </div>
  
  <div style="line-height: 1.8; font-size: 16px; text-align: justify; margin-bottom: 40px;">
    <p>TO WHOM IT MAY CONCERN:</p>
    
    <p style="text-indent: 40px;">
      This is to certify that <strong>{{full_name}}</strong>, <strong>{{age}}</strong> years old, <strong>{{civil_status}}</strong>, whose residence is located at <strong>{{address}}</strong>, is one of the indigent families in our barangay.
    </p>

    <p style="text-indent: 40px;">
      This certification implies that the aforementioned individual belongs to a low-income household and requires immediate financial or material assistance.
    </p>
    
    <p style="text-indent: 40px;">
      This certification is issued upon the request of the interested party for <strong>{{purpose}}</strong> purposes.
    </p>
    
    <p style="text-indent: 40px;">
      Issued this <strong>{{date}}</strong> at Barangay {{barangay_name}}, City of {{city}}, Philippines.
    </p>
  </div>
  
  <div style="display: flex; justify-content: flex-end; margin-top: 60px;">
    <div style="text-align: center; width: 250px;">
      <div style="border-bottom: 1px solid black; margin-bottom: 5px; height: 30px;"></div>
      <p style="margin: 0; font-weight: bold;">PUNONG BARANGAY</p>
      <p style="margin: 0; font-size: 12px;">(Signature over printed name)</p>
    </div>
  </div>
</div>
`;

export const BUSINESS_PERMIT_TEMPLATE = `
<div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white; color: black;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h3 style="margin: 0; font-weight: normal;">REPUBLIC OF THE PHILIPPINES</h3>
    <h3 style="margin: 5px 0; font-weight: normal;">MUNICIPALITY OF BALIUAG</h3>
    <h3 style="margin: 5px 0; font-weight: normal;">PROVINCE OF BULACAN</h3>
    <h2 style="margin: 20px 0 5px 0; font-weight: bold;">OFFICE OF THE BARANGAY TANGOS</h2>
    <h1 style="margin: 10px 0 20px 0; text-decoration: underline; font-size: 24px; font-weight: bold; color: #2563eb;">BARANGAY BUSINESS CLEARANCE</h1>
  </div>
  
  <div style="display: flex; justify-content: flex-end; margin-bottom: 40px; font-weight: bold; font-size: 14px;">
    <div>
      <p style="margin: 2px 0;">APPLICATION NO: ____________</p>
      <p style="margin: 2px 0;">PERMIT NO: ____________</p>
      <p style="margin: 2px 0;">SERIES OF: ____________</p>
    </div>
  </div>

  <div style="line-height: 1.8; font-size: 16px; text-align: justify; margin-bottom: 40px;">
    <p style="font-weight: bold;">TO WHOM IT MAY CONCERN:</p>
    
    <p style="text-indent: 40px; margin-top: 20px;">
      Permission is hereby granted to Mr/Mrs/Miss <strong>{{full_name}}</strong> of <strong>{{address}}</strong> to manage and operate <strong>{{purpose}}</strong> under the commercial name of <strong>{{purpose}}</strong> at <strong>{{address}}</strong>, Barangay, Tangos, effective today <strong>{{date}}</strong> up to December 31, <strong>2026</strong>.
    </p>
    
    <p style="text-indent: 40px;">
      This permit is granted subject to the condition that all existing laws, or ordinances, rules and regulations is governing the business hereby permitted are properly observed and subject to further to the condition mentioned in the business application which empowers the Barangay Captain or his authorized representatives to close or padlock said business place in case of revocation of this permit.
    </p>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-top: 80px;">
    <div style="width: 250px;">
      <p style="margin: 0; font-size: 12px; margin-bottom: 30px;">Specimen Signature:</p>
      <div style="border-bottom: 1px solid black; margin-bottom: 5px; height: 30px;"></div>
    </div>
    <div style="text-align: center; width: 250px;">
      <div style="border-bottom: 1px solid black; margin-bottom: 5px; height: 30px;"></div>
      <p style="margin: 0; font-weight: bold;">PUNONG BARANGAY</p>
      <p style="margin: 0; font-size: 12px;">(Signature over printed name)</p>
    </div>
  </div>
</div>
`;
