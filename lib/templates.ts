export const BARANGAY_CLEARANCE_TEMPLATE = `
<div style="font-family: 'Times New Roman', serif; background: white; color: black; width: 794px; min-height: 1123px; box-sizing: border-box; padding: 56px 64px; margin: 0 auto;">
  <div style="text-align:center;">
    <h2>Republic of the Philippines</h2>
    <h3>City of {{city}}</h3>
    <h3>Barangay {{barangay_name}}</h3>
  </div>
  <h3 style="text-align:center; margin-top:20px;">BARANGAY CLEARANCE</h3>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>
  This is to certify that <strong>{{full_name}}</strong>, {{age}} years old,
  {{civil_status}}, and a resident of {{address}}, Barangay {{barangay_name}},
  {{city}}, is known to be a person of good moral character and a law-abiding
  citizen in this barangay.
  </p>
  <p>
  This certification is issued upon the request of the above-named person for
  <strong>{{purpose}}</strong>.
  </p>
  <p>
  Issued this {{date}} at Barangay {{barangay_name}}, {{city}}.
  </p>
  <br><br>
  <p>______________________________</p>
  <p><strong>Barangay Captain</strong></p>
</div>
`;

export const CERTIFICATE_OF_INDIGENCY_TEMPLATE = `
<div style="font-family: 'Times New Roman', serif; background: white; color: black; width: 794px; min-height: 1123px; box-sizing: border-box; padding: 56px 64px; margin: 0 auto;">
  <div style="text-align:center;">
    <h2>Republic of the Philippines</h2>
    <h3>City of {{city}}</h3>
    <h3>Barangay {{barangay_name}}</h3>
  </div>
  <h3 style="text-align:center; margin-top:20px;">CERTIFICATE OF INDIGENCY</h3>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>
  This is to certify that <strong>{{full_name}}</strong>, {{age}} years old,
  {{civil_status}}, and a resident of {{address}}, Barangay {{barangay_name}},
  {{city}}, is one of the indigent residents of this barangay.
  </p>
  <p>
  This certification is issued upon the request of the above-named person for
  <strong>{{purpose}}</strong>.
  </p>
  <p>
  Issued this {{date}} at Barangay {{barangay_name}}, {{city}}.
  </p>
  <br><br>
  <p>______________________________</p>
  <p><strong>Barangay Captain</strong></p>
</div>
`;

export const BUSINESS_PERMIT_TEMPLATE = `
<div style="font-family: 'Times New Roman', serif; background: white; color: black; width: 794px; min-height: 1123px; box-sizing: border-box; padding: 56px 64px; margin: 0 auto;">
  <div style="text-align:center;">
    <h2>Republic of the Philippines</h2>
    <h3>City of {{city}}</h3>
    <h3>Barangay {{barangay_name}}</h3>
  </div>
  <h3 style="text-align:center; margin-top:20px;">BARANGAY BUSINESS CLEARANCE</h3>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>
  This is to certify that <strong>{{full_name}}</strong>, of legal age,
  {{civil_status}}, and a resident of {{address}}, Barangay {{barangay_name}},
  {{city}}, is applying for a business permit to operate
  <strong>{{purpose}}</strong>.
  </p>
  <p>
  This clearance is issued to certify that the applicant has complied with the
  requirements of this barangay and has no pending obligations.
  </p>
  <p>
  Issued this {{date}} at Barangay {{barangay_name}}, {{city}}.
  </p>
  <br><br>
  <p>______________________________</p>
  <p><strong>Barangay Captain</strong></p>
</div>
`;

export const CERTIFICATE_OF_RESIDENCY_TEMPLATE = `
<div style="font-family: 'Times New Roman', serif; background: white; color: black; width: 794px; min-height: 1123px; box-sizing: border-box; padding: 56px 64px; margin: 0 auto;">
  <div style="text-align:center;">
    <h2>Republic of the Philippines</h2>
    <h3>City of {{city}}</h3>
    <h3>Barangay {{barangay_name}}</h3>
  </div>
  <h3 style="text-align:center; margin-top:20px;">
    CERTIFICATE OF RESIDENCY
  </h3>
  <p>TO WHOM IT MAY CONCERN:</p>
  <p>
  This is to certify that <strong>{{full_name}}</strong>, {{age}} years old,
  {{civil_status}}, and a resident of {{address}}, Barangay {{barangay_name}},
  {{city}}, has been residing in this barangay for
  <strong>{{years_of_residency}} year(s)</strong>.
  </p>
  <p>
  This certification is issued upon the request of the above-named person for
  <strong>{{purpose}}</strong>.
  </p>
  <p>
  Issued this {{date}} at Barangay {{barangay_name}}, {{city}}.
  </p>
  <br><br>
  <p>______________________________</p>
  <p><strong>Barangay Captain</strong></p>
</div>
`;
