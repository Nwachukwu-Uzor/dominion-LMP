const banks = [
  {
    Code: "560",
    Name: "Page MFBank",
  },
  {
    Code: "304",
    Name: "Stanbic Mobile Money",
  },
  {
    Code: "308",
    Name: "FortisMobile",
  },
  {
    Code: "328",
    Name: "TagPay",
  },
  {
    Code: "309",
    Name: "FBNMobile",
  },
  {
    Code: "011",
    Name: "First Bank of Nigeria",
  },
  {
    Code: "326",
    Name: "Sterling Mobile",
  },
  {
    Code: "990",
    Name: "Omoluabi Mortgage Bank",
  },
  {
    Code: "311",
    Name: "ReadyCash (Parkway)",
  },
  {
    Code: "057",
    Name: "Zenith Bank",
  },
  {
    Code: "068",
    Name: "Standard Chartered Bank",
  },
  {
    Code: "306",
    Name: "eTranzact",
  },
  {
    Code: "070",
    Name: "Fidelity Bank",
  },
  {
    Code: "023",
    Name: "CitiBank",
  },
  {
    Code: "215",
    Name: "Unity Bank",
  },
  {
    Code: "323",
    Name: "Access Money",
  },
  {
    Code: "302",
    Name: "Eartholeum",
  },
  {
    Code: "324",
    Name: "Hedonmark",
  },
  {
    Code: "325",
    Name: "MoneyBox",
  },
  {
    Code: "301",
    Name: "JAIZ Bank",
  },
  {
    Code: "050",
    Name: "Ecobank Plc",
  },
  {
    Code: "307",
    Name: "EcoMobile",
  },
  {
    Code: "318",
    Name: "Fidelity Mobile",
  },
  {
    Code: "319",
    Name: "TeasyMobile",
  },
  {
    Code: "999",
    Name: "NIP Virtual Bank",
  },
  {
    Code: "320",
    Name: "VTNetworks",
  },
  {
    Code: "221",
    Name: "Stanbic IBTC Bank",
  },
  {
    Code: "501",
    Name: "Fortis Microfinance Bank",
  },
  {
    Code: "329",
    Name: "PayAttitude Online",
  },
  {
    Code: "322",
    Name: "ZenithMobile",
  },
  {
    Code: "303",
    Name: "ChamsMobile",
  },
  {
    Code: "403",
    Name: "SafeTrust Mortgage Bank",
  },
  {
    Code: "551",
    Name: "Covenant Microfinance Bank",
  },
  {
    Code: "415",
    Name: "Imperial Homes Mortgage Bank",
  },
  {
    Code: "552",
    Name: "NPF MicroFinance Bank",
  },
  {
    Code: "526",
    Name: "Parralex",
  },
  {
    Code: "035",
    Name: "Wema Bank",
  },
  {
    Code: "084",
    Name: "Enterprise Bank",
  },
  {
    Code: "063",
    Name: "Diamond Bank",
  },
  {
    Code: "305",
    Name: "Paycom",
  },
  {
    Code: "100",
    Name: "SunTrust Bank",
  },
  {
    Code: "317",
    Name: "Cellulant",
  },
  {
    Code: "401",
    Name: "ASO Savings and & Loans",
  },
  {
    Code: "030",
    Name: "Heritage",
  },
  {
    Code: "402",
    Name: "Jubilee Life Mortgage Bank",
  },
  {
    Code: "058",
    Name: "GTBank Plc",
  },
  {
    Code: "032",
    Name: "Union Bank",
  },
  {
    Code: "232",
    Name: "Sterling Bank",
  },
  {
    Code: "076",
    Name: "Skye Bank",
  },
  {
    Code: "082",
    Name: "Keystone Bank",
  },
  {
    Code: "327",
    Name: "Pagatech",
  },
  {
    Code: "559",
    Name: "Coronation Merchant Bank",
  },
  {
    Code: "601",
    Name: "FSDH",
  },
  {
    Code: "313",
    Name: "Mkudi",
  },
  {
    Code: "214",
    Name: "First City Monument Bank",
  },
  {
    Code: "314",
    Name: "FET",
  },
  {
    Code: "523",
    Name: "Trustbond",
  },
  {
    Code: "315",
    Name: "GTMobile",
  },
  {
    Code: "033",
    Name: "United Bank for Africa",
  },
  {
    Code: "044",
    Name: "Access Bank",
  },
];

export const BANKS_LIST = banks
  .sort((a, b) => a.Name.localeCompare(b.Name))
  .map((bank, index) => ({ id: index, label: bank.Name, value: bank.Code }));
