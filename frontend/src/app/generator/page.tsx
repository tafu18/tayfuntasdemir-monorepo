'use client';

import React, { useState, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import {
  ShieldCheck,
  CreditCard,
  UserCheck,
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  Building2,
  Smartphone,
  MapPin,
  Car,
  Key,
  Network,
  Binary,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Fingerprint
} from 'lucide-react';

type MainCategory = 'identity' | 'finance' | 'people' | 'system' | 'vehicles' | 'validator';
type OutputFormat = 'raw' | 'json' | 'csv' | 'sql';

// Turkish Names Database
const FIRST_NAMES_MALE = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'İsmail', 'Osman', 'Ömer',
  'Yusuf', 'Emre', 'Can', 'Burak', 'Mert', 'Furkan', 'Onur', 'Kaan', 'Tolga', 'Enes', 'Murat',
  'Serkan', 'Oğuz', 'Deniz', 'Barış', 'Kemal', 'Tayfun', 'Eren', 'Batuhan', 'Umut', 'Arda'
];

const FIRST_NAMES_FEMALE = [
  'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Büşra', 'Seda', 'Esra',
  'Tuğba', 'Ebru', 'Buse', 'Gamze', 'Derya', 'Gizem', 'Özlem', 'Selin', 'Damla', 'Yasemin',
  'İrem', 'Hilal', 'Ece', 'Aslı', 'Melis', 'Sinem', 'Hazal', 'Ceren', 'Berna', 'Deniz'
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
  'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
  'Erdoğan', 'Korkmaz', 'Polat', 'Taşdemir', 'Yalçın', 'Bulut', 'Keskin', 'Güneş', 'Aktaş', 'Avcı'
];

const TURKISH_CITIES = [
  { code: '01', name: 'Adana', districts: ['Seyhan', 'Çukurova', 'Yüreğir', 'Kozan'] },
  { code: '06', name: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut'] },
  { code: '07', name: 'Antalya', districts: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat'] },
  { code: '16', name: 'Bursa', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'İnegöl'] },
  { code: '26', name: 'Eskişehir', districts: ['Tepebaşı', 'Odunpazarı'] },
  { code: '34', name: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Bakırköy', 'Maltepe', 'Ataşehir', 'Pendik'] },
  { code: '35', name: 'İzmir', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli', 'Alsancak'] },
  { code: '41', name: 'Kocaeli', districts: ['İzmit', 'Gebze', 'Darıca', 'Körfez'] },
  { code: '55', name: 'Samsun', districts: ['İlkadım', 'Atakum', 'Canik'] },
  { code: '61', name: 'Trabzon', districts: ['Ortahisar', 'Akçaabat', 'Yomra'] },
];

const BANKS = [
  { code: '00010', name: 'Ziraat Bankası' },
  { code: '00062', name: 'Garanti BBVA' },
  { code: '00064', name: 'İş Bankası' },
  { code: '00067', name: 'Yapı Kredi' },
  { code: '00046', name: 'Akbank' },
  { code: '00111', name: 'QNB Finansbank' },
  { code: '00032', name: 'TEB' },
  { code: '00015', name: 'VakıfBank' },
  { code: '00012', name: 'Halkbank' },
  { code: '00203', name: 'Albaraka Türk' },
  { code: '00205', name: 'Kuveyt Türk' },
  { code: '00806', name: 'Papara Elektronik Para' },
];

export default function DataGenerator() {
  const [activeTab, setActiveTab] = useState<MainCategory>('identity');
  const [count, setCount] = useState<number>(5);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('raw');
  const [selectedBank, setSelectedBank] = useState<string>('00010'); // Default İş Bankası
  const [selectedCardBrand, setSelectedCardBrand] = useState<'troy' | 'visa' | 'mastercard' | 'amex'>('troy');
  const [selectedGender, setSelectedGender] = useState<'any' | 'male' | 'female'>('any');
  const [phoneFormat, setPhoneFormat] = useState<'e164' | 'national' | 'spaced'>('spaced');
  const [vinBrand, setVinBrand] = useState<string>('WBA'); // Default BMW

  // Output text
  const [outputText, setOutputText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeToolName, setActiveToolName] = useState<string>('TC Kimlik No');

  // Validator State
  const [validateInput, setValidateInput] = useState<string>('');
  const [validateType, setValidateType] = useState<'tckn' | 'vkn' | 'iban' | 'card'>('tckn');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);

  // --- ALGORİTMA FONKSİYONLARI ---

  // 1. TCKN Generator (Gerçek Algoritmik Checksum)
  const createTCKN = (isForeign: boolean = false): string => {
    const digits = new Array(11);

    if (isForeign) {
      digits[0] = 9;
      digits[1] = 9;
      for (let i = 2; i < 9; i++) {
        digits[i] = Math.floor(Math.random() * 10);
      }
    } else {
      digits[0] = Math.floor(Math.random() * 9) + 1; // 1-9 (ilk hane 0 olamaz)
      for (let i = 1; i < 9; i++) {
        digits[i] = Math.floor(Math.random() * 10);
      }
    }

    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

    let d10 = ((oddSum * 7) - evenSum) % 10;
    if (d10 < 0) d10 += 10;
    digits[9] = d10;

    let totalSum = 0;
    for (let i = 0; i < 10; i++) {
      totalSum += digits[i];
    }
    digits[10] = totalSum % 10;

    return digits.join('');
  };

  // 2. VKN (Vergi Kimlik No) Generator (Mod 10 Algoritması)
  const createVKN = (): string => {
    const digits = new Array(10);
    // İlk 9 hane rastgele
    for (let i = 0; i < 9; i++) {
      digits[i] = Math.floor(Math.random() * 10);
    }
    if (digits[0] === 0) digits[0] = 1; // Genelde 0 ile başlamaz

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const pos = 9 - i; // 9, 8, ..., 1
      let v = (digits[i] + pos) % 10;
      if (v !== 0) {
        v = (v * Math.pow(2, pos)) % 9;
        if (v === 0) v = 9;
      }
      sum += v;
    }

    digits[9] = (10 - (sum % 10)) % 10;
    return digits.join('');
  };

  // 3. MERSİS No Generator
  const createMersis = (): string => {
    const vkn = createVKN();
    return `0${vkn}0001${Math.floor(Math.random() * 90 + 10)}`;
  };

  // Modulo 97 helper without BigInt literals (compatible with all ECMAScript targets)
  const computeMod97 = (numericStr: string): number => {
    let remainder = 0;
    for (let i = 0; i < numericStr.length; i++) {
      remainder = (remainder * 10 + parseInt(numericStr.charAt(i), 10)) % 97;
    }
    return remainder;
  };

  // 4. TR IBAN Generator (ISO 7064 Mod 97-10)
  const createTRIban = (bankCodeInput?: string): string => {
    const bCode = bankCodeInput || selectedBank;
    let accountNum = '';
    for (let i = 0; i < 16; i++) {
      accountNum += Math.floor(Math.random() * 10).toString();
    }

    // BBAN = BankCode(5) + Reserve(0) + Account(16)
    const bban = `${bCode}0${accountNum}`;

    // Check digits calculation: (BBAN + '292700') % 97
    // T=29, R=27 -> '292700'
    const numericStr = `${bban}292700`;
    const mod = computeMod97(numericStr);
    const checkDigits = String(98 - mod).padStart(2, '0');

    return `TR${checkDigits}${bban}`;
  };

  // 5. Test Kredi Kartı Generator (Luhn Algoritması)
  const createCreditCard = (brand: 'troy' | 'visa' | 'mastercard' | 'amex') => {
    let length = 16;
    let prefix = '4'; // Visa

    if (brand === 'mastercard') {
      prefix = (Math.floor(Math.random() * 5) + 51).toString(); // 51-55
    } else if (brand === 'troy') {
      prefix = '9792';
    } else if (brand === 'amex') {
      prefix = Math.random() > 0.5 ? '34' : '37';
      length = 15;
    }

    const digits: number[] = prefix.split('').map(Number);
    while (digits.length < length - 1) {
      digits.push(Math.floor(Math.random() * 10));
    }

    // Luhn Checksum
    let sum = 0;
    const isEven = (length % 2 === 0);
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i];
      if ((i % 2 === 0 && isEven) || (i % 2 !== 0 && !isEven)) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    digits.push(checkDigit);

    const cardNumber = digits.join('');
    const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const expYear = String(new Date().getFullYear() % 100 + Math.floor(Math.random() * 5) + 1).padStart(2, '0');
    const cvv = String(Math.floor(Math.random() * (brand === 'amex' ? 9000 : 900)) + (brand === 'amex' ? 1000 : 100));

    return {
      brand: brand.toUpperCase(),
      cardNumber,
      formattedCard: cardNumber.replace(/(\d{4})/g, '$1 ').trim(),
      exp: `${expMonth}/${expYear}`,
      cvv
    };
  };

  // 6. Telefon Numarası Generator
  const createPhoneNumber = (): string => {
    const prefixes = ['530', '532', '533', '535', '541', '542', '544', '545', '551', '552', '553', '554', '555', '505', '506', '507'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const p1 = Math.floor(Math.random() * 900 + 100);
    const p2 = Math.floor(Math.random() * 90 + 10);
    const p3 = Math.floor(Math.random() * 90 + 10);

    if (phoneFormat === 'e164') return `+90${prefix}${p1}${p2}${p3}`;
    if (phoneFormat === 'national') return `0${prefix}${p1}${p2}${p3}`;
    return `+90 ${prefix} ${p1} ${p2} ${p3}`;
  };

  // 7. Kişi / İsim Üretici
  const createPerson = () => {
    const isMale = selectedGender === 'male' ? true : selectedGender === 'female' ? false : Math.random() > 0.5;
    const firstName = isMale
      ? FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]
      : FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    // Turkish char clean for email
    const cleanStr = (s: string) => s.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');

    const emailProviders = ['gmail.com', 'outlook.com', 'hotmail.com', 'yandex.com', 'example.com'];
    const domain = emailProviders[Math.floor(Math.random() * emailProviders.length)];
    const email = `${cleanStr(firstName)}.${cleanStr(lastName)}${Math.floor(Math.random() * 99 + 1)}@${domain}`;

    const cityObj = TURKISH_CITIES[Math.floor(Math.random() * TURKISH_CITIES.length)];
    const district = cityObj.districts[Math.floor(Math.random() * cityObj.districts.length)];
    const postalCode = `${cityObj.code}${Math.floor(Math.random() * 900 + 100)}`;
    const streetNum = Math.floor(Math.random() * 120 + 1);
    const aptNum = Math.floor(Math.random() * 30 + 1);
    const address = `Atatürk Mah. Cumhuriyet Cad. No: ${streetNum} D: ${aptNum}, ${district} / ${cityObj.name} (${postalCode})`;

    return {
      tckn: createTCKN(false),
      fullName: `${firstName} ${lastName}`,
      gender: isMale ? 'Erkek' : 'Kadın',
      email,
      phone: createPhoneNumber(),
      city: cityObj.name,
      district,
      address,
      iban: createTRIban(),
    };
  };

  // 8. Araç Plaka Üretici
  const createPlate = (): string => {
    const letters = 'ABCDEFGHJKLMNPRSTUVYZ';
    const city = String(Math.floor(Math.random() * 81) + 1).padStart(2, '0');
    const charCount = Math.floor(Math.random() * 2) + 2;
    let mid = '';
    for (let j = 0; j < charCount; j++) mid += letters.charAt(Math.floor(Math.random() * letters.length));
    let endNum = String(Math.floor(Math.random() * 900 + 100));
    return `${city} ${mid} ${endNum}`;
  };

  // 9. Şasi Numarası (VIN)
  const createVIN = (): string => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vds = '';
    for (let j = 0; j < 6; j++) vds += chars.charAt(Math.floor(Math.random() * chars.length));
    const yearChar = 'ABCDEFGHJKLMNPRSTVWXY123456789'.charAt(Math.floor(Math.random() * 30));
    const plant = chars.charAt(Math.floor(Math.random() * chars.length));
    let serial = '';
    for (let j = 0; j < 6; j++) serial += Math.floor(Math.random() * 10).toString();
    return `${vinBrand}${vds}${yearChar}${plant}${serial}`;
  };

  // --- TOPLU ÇIKTI FORMATLAYICI ---
  const formatOutputList = useCallback((dataList: any[], label: string) => {
    if (outputFormat === 'json') {
      setOutputText(JSON.stringify(dataList, null, 2));
      return;
    }

    if (outputFormat === 'csv') {
      if (typeof dataList[0] === 'object') {
        const keys = Object.keys(dataList[0]);
        const headerRow = keys.join(',');
        const rows = dataList.map(item => keys.map(k => `"${String(item[k]).replace(/"/g, '""')}"`).join(','));
        setOutputText([headerRow, ...rows].join('\n'));
      } else {
        setOutputText(`value\n` + dataList.map(v => `"${v}"`).join('\n'));
      }
      return;
    }

    if (outputFormat === 'sql') {
      const tableName = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (typeof dataList[0] === 'object') {
        const keys = Object.keys(dataList[0]);
        const insertRows = dataList.map(item => {
          const vals = keys.map(k => `'${String(item[k]).replace(/'/g, "''")}'`).join(', ');
          return `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${vals});`;
        });
        setOutputText(insertRows.join('\n'));
      } else {
        const insertRows = dataList.map(val => `INSERT INTO ${tableName} (value) VALUES ('${val}');`);
        setOutputText(insertRows.join('\n'));
      }
      return;
    }

    // Default: Raw Lines
    if (typeof dataList[0] === 'object') {
      setOutputText(dataList.map(item => Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(' | ')).join('\n\n'));
    } else {
      setOutputText(dataList.join('\n'));
    }
  }, [outputFormat]);

  // --- ÜRETİCİ TETİKLEYİCİLERİ ---
  const handleGenerate = (type: string) => {
    setActiveToolName(type);
    const results: any[] = [];

    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'TCKN':
          results.push(createTCKN(false));
          break;
        case 'YKN (Yabancı Kimlik)':
          results.push(createTCKN(true));
          break;
        case 'VKN (Vergi No)':
          results.push(createVKN());
          break;
        case 'MERSİS No':
          results.push(createMersis());
          break;
        case 'TR IBAN':
          results.push(createTRIban());
          break;
        case 'Test Kredi Kartı':
          results.push(createCreditCard(selectedCardBrand));
          break;
        case 'Kişi Profili':
          results.push(createPerson());
          break;
        case 'Telefon Numarası':
          results.push(createPhoneNumber());
          break;
        case 'Türkiye Plaka':
          results.push(createPlate());
          break;
        case 'Şasi No (VIN)':
          results.push(createVIN());
          break;
        case 'UUID v4':
          results.push(crypto.randomUUID());
          break;
        case 'MAC Adresi': {
          const hex = '0123456789ABCDEF';
          let mac = '';
          for (let j = 0; j < 6; j++) {
            mac += hex.charAt(Math.floor(Math.random() * 16)) + hex.charAt(Math.floor(Math.random() * 16));
            if (j !== 5) mac += ':';
          }
          results.push(mac);
          break;
        }
        case 'IPv4 Adresi':
          results.push(`${Math.floor(Math.random() * 223 + 1)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254 + 1)}`);
          break;
        default:
          results.push(createTCKN());
      }
    }

    formatOutputList(results, type);
  };

  // --- DOĞRULAMA (VALIDATOR) FONKSİYONLARI ---
  const handleValidate = () => {
    const rawVal = validateInput.trim().replace(/\s+/g, '');
    if (!rawVal) {
      setValidationResult(null);
      return;
    }

    if (validateType === 'tckn') {
      if (!/^\d{11}$/.test(rawVal) || rawVal.startsWith('0')) {
        setValidationResult({ isValid: false, message: 'TCKN tam 11 haneli olmalı ve 0 ile başlayamaz.' });
        return;
      }
      const d = rawVal.split('').map(Number);
      const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
      const evenSum = d[1] + d[3] + d[5] + d[7];
      let d10 = ((oddSum * 7) - evenSum) % 10;
      if (d10 < 0) d10 += 10;
      const d11 = (d.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;

      if (d[9] === d10 && d[10] === d11) {
        setValidationResult({ isValid: true, message: 'Geçerli TCKN Algoritması (Checksum Başarılı) ✅' });
      } else {
        setValidationResult({ isValid: false, message: 'Geçersiz TCKN (Algoritmik kontrol basamağı uyuşmuyor) ❌' });
      }
    } else if (validateType === 'vkn') {
      if (!/^\d{10}$/.test(rawVal)) {
        setValidationResult({ isValid: false, message: 'Vergi No (VKN) tam 10 haneli rakam olmalıdır.' });
        return;
      }
      const d = rawVal.split('').map(Number);
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        const pos = 9 - i;
        let v = (d[i] + pos) % 10;
        if (v !== 0) {
          v = (v * Math.pow(2, pos)) % 9;
          if (v === 0) v = 9;
        }
        sum += v;
      }
      const lastDigit = (10 - (sum % 10)) % 10;
      if (d[9] === lastDigit) {
        setValidationResult({ isValid: true, message: 'Geçerli VKN Algoritması (Vergi No Doğrulandı) ✅' });
      } else {
        setValidationResult({ isValid: false, message: 'Geçersiz VKN (Son basamak kontrol toplamını sağlamıyor) ❌' });
      }
    } else if (validateType === 'iban') {
      const cleanIban = rawVal.toUpperCase();
      if (!/^TR\d{24}$/.test(cleanIban)) {
        setValidationResult({ isValid: false, message: 'Türkiye IBAN formatı TR ile başlamalı ve toplam 26 karakter olmalıdır.' });
        return;
      }
      const bban = cleanIban.substring(4);
      const numericStr = `${bban}292700`;
      const mod = computeMod97(numericStr);
      const expectedCheck = String(98 - mod).padStart(2, '0');
      const actualCheck = cleanIban.substring(2, 4);

      if (actualCheck === expectedCheck) {
        const bankCode = cleanIban.substring(4, 9);
        const bankObj = BANKS.find(b => b.code === bankCode);
        setValidationResult({
          isValid: true,
          message: `Geçerli TR IBAN ✅ (Banka: ${bankObj ? bankObj.name : 'Bilinmeyen / Kod: ' + bankCode})`
        });
      } else {
        setValidationResult({ isValid: false, message: 'Geçersiz IBAN (Kontrol basamağı hatalı) ❌' });
      }
    } else if (validateType === 'card') {
      const cleanCard = rawVal.replace(/\D/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        setValidationResult({ isValid: false, message: 'Kredi kartı numarası 13-19 hane arasında olmalıdır.' });
        return;
      }
      let sum = 0;
      let shouldDouble = false;
      for (let i = cleanCard.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanCard.charAt(i), 10);
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      if (sum % 10 === 0) {
        setValidationResult({ isValid: true, message: 'Geçerli Kart Numarası (Luhn Algoritması Doğrulandı) ✅' });
      } else {
        setValidationResult({ isValid: false, message: 'Geçersiz Kart Numarası (Luhn Checksum Hatalı) ❌' });
      }
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!outputText) return;
    const ext = outputFormat === 'json' ? 'json' : outputFormat === 'csv' ? 'csv' : outputFormat === 'sql' ? 'sql' : 'txt';
    const mime = outputFormat === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([outputText], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_verisi_${activeToolName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const faqItems = [
    {
      question: 'Burada üretilen TCKN veya Vergi Numaraları gerçek kişilere mi ait?',
      answer: 'HAYIR. Bu araçta üretilen tüm TCKN, Vergi No (VKN), IBAN ve Kredi Kartı numaraları tamamen matematiksel algoritmalara (Mod 10, Mod 97, Luhn) uygun olarak sıfırdan rastgele üretilen sanal test verileridir. Herhangi bir gerçek kişi veya kurumla ilişkisi yoktur.'
    },
    {
      question: 'Bu veriler form doğrulama (Validation) kurallarından geçer mi?',
      answer: 'EVET! E-ticaret, ERP, CRM, kayıt formları veya QA testlerinizde kullandığınız tüm algoritmik doğrulama kontrollerinden (TC Kimlik algoritması, Vergi No algoritması, IBAN kontrol basamağı vb.) %100 başarıyla geçer.'
    },
    {
      question: 'Üretilen veya doğrulanan veriler sunucuya gönderiliyor mu?',
      answer: 'HAYIR. Tüm üretim ve doğrulama mantığı tamamen istemci taraflı (Client-Side) tarayıcınızın içinde JavaScript ile çalışır. Sunucumuza tek bir istek dahi gönderilmez.'
    },
    {
      question: 'Toplu (JSON, CSV, SQL) veri dışa aktarımı nasıl yapılır?',
      answer: 'Çıktı formatı bölümünden JSON, CSV veya SQL seçeneklerinden birini belirleyin ve üretmek istediğiniz adet sayısını (10, 25, 50, 100) seçtikten sonra üret butonuna basarak doğrudan projenize veya veritabanınıza aktarabilirsiniz.'
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gelişmiş Mock & QA Test Verisi Laboratuvarı</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Test Verisi Üretici & Doğrulayıcı
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            Yazılım, API ve QA testleriniz için algoritmik kurallara uygun gerçekçi TCKN, Vergi No, TR IBAN, Test Kartı, Kişi Profili ve Sistem verileri üretin.
          </p>
        </div>

        {/* Privacy Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200">
            <strong className="font-semibold">Gizlilik Garantisi:</strong> Tüm veriler tarayıcınızda üretilir. Gerçek kişilere ait değildir, hiçbir veri kaydedilmez veya sunucuya gönderilmez.
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-8">
          {[
            { id: 'identity', label: 'TCKN & Vergi', icon: UserCheck },
            { id: 'finance', label: 'IBAN & Kart', icon: CreditCard },
            { id: 'people', label: 'Kişi & İletişim', icon: Smartphone },
            { id: 'system', label: 'Sistem & Ağ', icon: Binary },
            { id: 'vehicles', label: 'Plaka & Şasi', icon: Car },
            { id: 'validator', label: 'Doğrulayıcı (Validator)', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as MainCategory)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${isActive
                  ? 'bg-white dark:bg-zinc-800 text-brand-blue dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tool Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">

            {/* Generator Action Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6">

              {/* Tab 1: Identity & Tax */}
              {activeTab === 'identity' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-brand-blue" />
                    Kimlik ve Vergi Verileri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerate('TCKN')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-brand-blue/10 border border-slate-200 dark:border-zinc-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-blue flex items-center justify-between">
                        <span>TC Kimlik No (TCKN)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">11 Hane</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Geçerli Mod 10 checksum algoritması</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate('VKN (Vergi No)')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-brand-blue/10 border border-slate-200 dark:border-zinc-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-blue flex items-center justify-between">
                        <span>Vergi Kimlik No (VKN)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">10 Hane</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Şirket / Kurum resmi vergi algoritması</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate('YKN (Yabancı Kimlik)')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-brand-blue/10 border border-slate-200 dark:border-zinc-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-blue flex items-center justify-between">
                        <span>Yabancı Kimlik No (YKN)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">99...</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">99 ile başlayan yabancı kimlik formatı</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate('MERSİS No')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-brand-blue/10 border border-slate-200 dark:border-zinc-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-blue flex items-center justify-between">
                        <span>MERSİS Numarası</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">16 Hane</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Ticaret sicil MERSİS formatı</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Finance & Cards */}
              {activeTab === 'finance' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Finans, IBAN & Test Kartları
                  </h3>

                  {/* Bank Selector for IBAN */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Banka Seçin (IBAN İçin):</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    >
                      {BANKS.map((b) => (
                        <option key={b.code} value={b.code}>{b.name} (Kod: {b.code})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerate('TR IBAN')}
                    className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Seçilen Banka ile TR IBAN Üret</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Kart Tipi (Luhn Algoritmalı):</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['troy', 'visa', 'mastercard', 'amex'] as const).map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setSelectedCardBrand(brand)}
                          className={`p-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${selectedCardBrand === brand
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                            }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerate('Test Kredi Kartı')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Test Kredi Kartı Paketi Üret (No + SKT + CVV)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: People & Contact */}
              {activeTab === 'people' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                    Kişi ve İletişim Bilgileri
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'any', label: 'Karışık Cinsiyet' },
                      { id: 'male', label: 'Sadece Erkek' },
                      { id: 'female', label: 'Sadece Kadın' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGender(g.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedGender === g.id
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                          }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerate('Kişi Profili')}
                      className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-purple-950 dark:text-purple-200 group-hover:text-purple-600">
                        Komple Kişi Profili
                      </div>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-1">İsim, TCKN, E-posta, Telefon, Adres, IBAN</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate('Telefon Numarası')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 hover:bg-brand-blue/10 border border-slate-200 dark:border-zinc-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-blue">
                        Türkiye Telefon No (GSM)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">053x, 054x, 055x operatör formatlı</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: System & Dev */}
              {activeTab === 'system' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <Binary className="w-5 h-5 text-cyan-500" />
                    Sistem ve Ağ Verileri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerate('UUID v4')}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-brand-blue transition-all cursor-pointer"
                    >
                      UUID v4
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('MAC Adresi')}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-brand-blue transition-all cursor-pointer"
                    >
                      MAC Adresi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('IPv4 Adresi')}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-brand-blue transition-all cursor-pointer"
                    >
                      IPv4 Adresi
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 5: Vehicles */}
              {activeTab === 'vehicles' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-500" />
                    Araç Plaka ve Şasi (VIN)
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Marka Kodu (VIN İçin):</label>
                    <select
                      value={vinBrand}
                      onChange={(e) => setVinBrand(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="WBA">BMW (WBA)</option>
                      <option value="WDB">Mercedes-Benz (WDB)</option>
                      <option value="WVW">Volkswagen (WVW)</option>
                      <option value="WAU">Audi (WAU)</option>
                      <option value="VF1">Renault (VF1)</option>
                      <option value="NM4">Fiat Tofaş Türkiye (NM4)</option>
                      <option value="VF3">Peugeot (VF3)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerate('Türkiye Plaka')}
                      className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Türkiye Plaka Üret
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('Şasi No (VIN)')}
                      className="py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Şasi No (VIN) Üret
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 6: Real-time Validator */}
              {activeTab === 'validator' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Canlı Algoritmik Doğrulayıcı
                  </h3>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'tckn', label: 'TCKN' },
                      { id: 'vkn', label: 'Vergi No' },
                      { id: 'iban', label: 'TR IBAN' },
                      { id: 'card', label: 'Kredi Kartı' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => { setValidateType(v.id as any); setValidationResult(null); }}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${validateType === v.id
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                          }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={validateInput}
                      onChange={(e) => setValidateInput(e.target.value)}
                      placeholder={
                        validateType === 'tckn' ? '11 haneli TCKN girin...' :
                          validateType === 'vkn' ? '10 haneli Vergi No girin...' :
                            validateType === 'iban' ? 'TR... IBAN girin...' : 'Kart numarası girin...'
                      }
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleValidate}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Doğrula (Validate)
                    </button>
                  </div>

                  {validationResult && (
                    <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${validationResult.isValid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                      }`}>
                      {validationResult.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{validationResult.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity & Format Controls */}
              {activeTab !== 'validator' && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">Üretim Adedi:</label>
                      <div className="flex gap-1.5">
                        {[1, 5, 10, 25, 50].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCount(c)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${count === c
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                              }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Output Format */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">Çıktı Formatı:</label>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'raw', label: 'Metin' },
                          { id: 'json', label: 'JSON' },
                          { id: 'csv', label: 'CSV' },
                          { id: 'sql', label: 'SQL' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setOutputFormat(f.id as OutputFormat)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${outputFormat === f.id
                              ? 'bg-brand-blue text-white'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                              }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Output Results Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4 flex flex-col h-full">

              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-brand-blue" />
                  Üretilen Test Verileri ({activeToolName})
                </span>

                <div className="flex items-center gap-1.5">
                  {outputText && (
                    <>
                      <button
                        type="button"
                        onClick={downloadFile}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-brand-blue transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                        title="İndir"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">İndir</span>
                      </button>

                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${copied ? 'bg-emerald-600 text-white' : 'bg-brand-blue text-white shadow-sm'
                          }`}
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOutputText('')}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Temizle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Output Content Area */}
              <div className="flex-1 min-h-[320px] relative">
                {outputText ? (
                  <textarea
                    readOnly
                    value={outputText}
                    className="w-full h-full min-h-[320px] p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none select-all resize-y leading-relaxed"
                  />
                ) : (
                  <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-400">
                    <Binary className="w-10 h-10 mb-3 opacity-40 text-brand-blue" />
                    <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">Henüz Veri Üretilmedi</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Soldaki panellerden TCKN, Vergi No, IBAN, Kart veya Kişi seçeneklerinden birine tıklayın.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* FAQs */}
        <div className="mt-12">
          <FAQ items={faqItems} />
        </div>

        {/* Other Tools Navigation */}
        <OtherTools />

      </div>
    </PageTransition>
  );
}