'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageTransition from '@/components/PageTransition';
import FAQ from '@/components/FAQ';
import OtherTools from '@/components/OtherTools';
import {
  Globe,
  Code2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Terminal,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  FileCode,
  Layers,
  Send,
  Loader2
} from 'lucide-react';

type TargetLanguage = 'fetch' | 'axios' | 'python' | 'php' | 'go' | 'csharp' | 'java' | 'rust';

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data: string | null;
  auth: { user: string; pass: string } | null;
}

const DEFAULT_CURL = `curl 'https://api.tayfuntasdemir.com.tr/api/posts' \\
  -H 'accept: application/json' \\
  -H 'content-type: application/json' \\
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\
  --data-raw '{"title":"Yeni Blog Yazısı","category":"Yazılım","published":true}'`;

export default function CurlConverter() {
  const [curlInput, setCurlInput] = useState<string>(DEFAULT_CURL);
  const [selectedLang, setSelectedLang] = useState<TargetLanguage>('fetch');
  const [copied, setCopied] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>('');

  // Live Test State
  const [isSending, setIsSending] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  // cURL Parser Logic
  const parseCurl = useCallback((curlStr: string): ParsedCurl => {
    let clean = curlStr.trim().replace(/\\\n/g, ' ').replace(/\n/g, ' ');
    
    // Remove "curl" prefix
    clean = clean.replace(/^curl\s+/i, '');

    let url = '';
    let method = 'GET';
    const headers: Record<string, string> = {};
    let data: string | null = null;
    let auth: { user: string; pass: string } | null = null;

    // Tokenizer supporting quotes
    const tokens: string[] = [];
    let currentToken = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
      } else {
        currentToken += char;
      }
    }
    if (currentToken) tokens.push(currentToken);

    // Process tokens
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      // Clean wrapping quotes
      const cleanToken = (t: string) => t.replace(/^['"]|['"]$/g, '');

      if (token === '-X' || token === '--request') {
        method = cleanToken(tokens[++i] || 'GET').toUpperCase();
      } else if (token === '-H' || token === '--header') {
        const headerStr = cleanToken(tokens[++i] || '');
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const key = headerStr.substring(0, colonIdx).trim();
          const val = headerStr.substring(colonIdx + 1).trim();
          headers[key] = val;
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
        data = cleanToken(tokens[++i] || '');
        if (method === 'GET') method = 'POST';
      } else if (token === '-u' || token === '--user') {
        const userPass = cleanToken(tokens[++i] || '').split(':');
        auth = { user: userPass[0] || '', pass: userPass[1] || '' };
      } else if (token.startsWith('http://') || token.startsWith('https://')) {
        url = cleanToken(token);
      } else if (!token.startsWith('-') && !url) {
        url = cleanToken(token);
      }
    }

    if (!url) {
      // Try regex search for URL
      const urlMatch = curlStr.match(/https?:\/\/[^\s'"]+/);
      if (urlMatch) url = urlMatch[0];
    }

    return { url, method, headers, data, auth };
  }, []);

  // Code Generators for 8+ Languages
  const generatedCode = useMemo(() => {
    setParseError('');
    if (!curlInput.trim()) return '';

    try {
      const parsed = parseCurl(curlInput);
      if (!parsed.url) {
        setParseError('Geçerli bir URL bulunamadı. Lütfen cURL komutunuzu kontrol edin.');
        return '';
      }

      const { url, method, headers, data, auth } = parsed;

      // 1. JavaScript Fetch API
      if (selectedLang === 'fetch') {
        const options: any = { method };
        if (Object.keys(headers).length > 0) options.headers = headers;
        if (data) {
          try {
            options.body = JSON.stringify(JSON.parse(data), null, 2);
          } catch {
            options.body = data;
          }
        }

        let headersStr = '';
        if (Object.keys(headers).length > 0) {
          headersStr = `,\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`;
        }
        let bodyStr = '';
        if (data) {
          try {
            const parsedJson = JSON.parse(data);
            bodyStr = `,\n  body: JSON.stringify(${JSON.stringify(parsedJson, null, 4).replace(/\n/g, '\n  ')})`;
          } catch {
            bodyStr = `,\n  body: ${JSON.stringify(data)}`;
          }
        }

        return `async function sendRequest() {
  try {
    const response = await fetch('${url}', {
      method: '${method}'${headersStr}${bodyStr}
    });

    const data = await response.json();
    console.log('Başarılı:', data);
    return data;
  } catch (error) {
    console.error('Hata:', error);
  }
}

sendRequest();`;
      }

      // 2. JavaScript / TypeScript Axios
      if (selectedLang === 'axios') {
        let headersStr = '';
        if (Object.keys(headers).length > 0) {
          headersStr = `,\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`;
        }
        let dataStr = '';
        if (data) {
          try {
            const parsedJson = JSON.parse(data);
            dataStr = `,\n  data: ${JSON.stringify(parsedJson, null, 4).replace(/\n/g, '\n  ')}`;
          } catch {
            dataStr = `,\n  data: ${JSON.stringify(data)}`;
          }
        }

        return `import axios from 'axios';

async function sendRequest() {
  try {
    const response = await axios({
      method: '${method.toLowerCase()}',
      url: '${url}'${headersStr}${dataStr}
    });

    console.log('Yanıt:', response.data);
    return response.data;
  } catch (error) {
    console.error('Axios Hatası:', error);
  }
}

sendRequest();`;
      }

      // 3. Python Requests
      if (selectedLang === 'python') {
        let headersStr = '';
        if (Object.keys(headers).length > 0) {
          headersStr = `headers = ${JSON.stringify(headers, null, 4)}\n`;
        }
        let dataStr = '';
        let argStr = '';
        if (data) {
          try {
            const parsedJson = JSON.parse(data);
            dataStr = `json_data = ${JSON.stringify(parsedJson, null, 4)}\n`;
            argStr = `, json=json_data`;
          } catch {
            dataStr = `data = """${data}"""\n`;
            argStr = `, data=data`;
          }
        }

        const hArg = Object.keys(headers).length > 0 ? ', headers=headers' : '';

        return `import requests

url = '${url}'
${headersStr}${dataStr}
response = requests.${method.toLowerCase()}(
    url${hArg}${argStr}
)

print('Durum Kodu:', response.status_code)
print('Yanıt:', response.json() if 'application/json' in response.headers.get('Content-Type', '') else response.text)`;
      }

      // 4. PHP (Guzzle & cURL)
      if (selectedLang === 'php') {
        let headersCode = '';
        Object.entries(headers).forEach(([k, v]) => {
          headersCode += `    '${k}' => '${v}',\n`;
        });

        let bodyCode = '';
        if (data) {
          try {
            const parsedJson = JSON.parse(data);
            bodyCode = `    'json' => ${JSON.stringify(parsedJson, null, 8)},\n`;
          } catch {
            bodyCode = `    'body' => '${data}',\n`;
          }
        }

        return `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;

$client = new Client();

$response = $client->request('${method}', '${url}', [
    'headers' => [
${headersCode}    ],
${bodyCode}]);

echo $response->getBody();`;
      }

      // 5. Go (net/http)
      if (selectedLang === 'go') {
        let bodyInit = 'nil';
        let bodyImport = '';
        if (data) {
          bodyInit = `bytes.NewBuffer([]byte(\`${data}\`))`;
          bodyImport = `\n\t"bytes"`;
        }

        let headerAdds = '';
        Object.entries(headers).forEach(([k, v]) => {
          headerAdds += `\treq.Header.Set("${k}", "${v}")\n`;
        });

        return `package main

import (
\t"fmt"${bodyImport}
\t"io"
\t"net/http"
)

func main() {
\turl := "${url}"
\treq, err := http.NewRequest("${method}", url, ${bodyInit})
\tif err != nil {
\t\tpanic(err)
\t}

${headerAdds}
\tclient := &http.Client{}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tbody, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(body))
}`;
      }

      // 6. C# (.NET HttpClient)
      if (selectedLang === 'csharp') {
        let contentCode = '';
        if (data) {
          contentCode = `\n        var content = new StringContent(@"${data.replace(/"/g, '""')}", Encoding.UTF8, "application/json");\n        request.Content = content;`;
        }

        let headerAdds = '';
        Object.entries(headers).forEach(([k, v]) => {
          if (k.toLowerCase() !== 'content-type') {
            headerAdds += `\n        request.Headers.TryAddWithoutValidation("${k}", "${v}");`;
          }
        });

        return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        using var request = new HttpRequestMessage(HttpMethod.${method === 'GET' ? 'Get' : method === 'POST' ? 'Post' : method === 'PUT' ? 'Put' : 'Delete'}, "${url}");
        ${headerAdds}${contentCode}

        var response = await client.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseBody);
    }
}`;
      }

      // 7. Java (HttpClient)
      if (selectedLang === 'java') {
        let bodyPublisher = 'HttpRequest.BodyPublishers.noBody()';
        if (data) {
          bodyPublisher = `HttpRequest.BodyPublishers.ofString("${data.replace(/"/g, '\\"')}")`;
        }

        let headerLines = '';
        Object.entries(headers).forEach(([k, v]) => {
          headerLines += `\n            .header("${k}", "${v}")`;
        });

        return `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${url}"))
            .method("${method}", ${bodyPublisher})${headerLines}
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}`;
      }

      // 8. Rust (reqwest)
      if (selectedLang === 'rust') {
        let headersCode = '';
        Object.entries(headers).forEach(([k, v]) => {
          headersCode += `\n        .header("${k}", "${v}")`;
        });
        let bodyCode = '';
        if (data) {
          bodyCode = `\n        .body(r#"${data}"#)`;
        }

        return `#[tokio::main]
async func main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let res = client.${method.toLowerCase()}("${url}")${headersCode}${bodyCode}
        .send()
        .await?
        .text()
        .await?;

    println!("{:#?}", res);
    Ok(())
}`;
      }

      return '';
    } catch (e: any) {
      setParseError('Ayrıştırma Hatası: ' + e.message);
      return '';
    }
  }, [curlInput, selectedLang, parseCurl]);

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = (sampleCurl: string) => {
    setCurlInput(sampleCurl);
    setTestResponse(null);
  };

  // Live Test Executor
  const handleTestRequest = async () => {
    setIsSending(true);
    setTestResponse(null);

    try {
      const parsed = parseCurl(curlInput);
      if (!parsed.url) {
        setTestResponse('Hata: Geçerli URL bulunamadı.');
        return;
      }

      const options: RequestInit = {
        method: parsed.method,
        headers: parsed.headers,
      };

      if (parsed.data && parsed.method !== 'GET') {
        options.body = parsed.data;
      }

      const res = await fetch(parsed.url, options);
      const text = await res.text();

      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // Not JSON
      }

      setTestResponse(`HTTP ${res.status} ${res.statusText}\n\n${formatted}`);
    } catch (err: any) {
      setTestResponse(`Bağlantı Hatası (CORS veya Ağ): ${err.message}\n\nNot: Hedef sunucu tarayıcıdan gelen isteklere (CORS) izin vermiyorsa istek tarayıcı tarafından engellenebilir.`);
    } finally {
      setIsSending(false);
    }
  };

  const faqItems = [
    {
      question: 'cURL nedir ve neden dönüştürülür?',
      answer: 'cURL, komut satırından HTTP/HTTPS istekleri atmak için kullanılan standart bir araçtır. Tarayıcılarda (Chrome, Firefox vb.) Network sekmesindeki herhangi bir API isteğine sağ tıklayıp "Copy as cURL" dediğinizde tüm başlıklar ve gövdeyle birlikte cURL komutunu alırsınız. Bu araç, bu cURL komutunu tek tıkla projenizde kullanacağınız programlama diline (Fetch, Axios, Python vb.) dönüştürür.'
    },
    {
      question: 'Hangi programlama dilleri ve kütüphaneler destekleniyor?',
      answer: 'JavaScript (Fetch API & Axios), Python (Requests), PHP (Guzzle & cURL), Go (net/http), C# (.NET HttpClient), Java (HttpClient) ve Rust (reqwest) dillerine tam uyumlu kod çıktısı üretilir.'
    },
    {
      question: 'Bu işlem sırasında cURL komutumdaki hassas bilgiler (Token, API Key) güvende mi?',
      answer: 'EVET. Bu araç %100 İstemci Taraflı (Client-Side) çalışır. Girdiğiniz cURL komutları ve içerisindeki API anahtarları veya şifreler hiçbir şekilde sunucuya gönderilmez, kaydedilmez veya loglanmaz.'
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue font-semibold text-xs border border-brand-blue/20">
            <Globe className="w-3.5 h-3.5" />
            <span>API Kod Üretici & Entegrasyon Aracı</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            cURL Kod Dönüştürücü (Converter)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
            cURL komutlarınızı anında JavaScript Fetch, Axios, Python Requests, PHP Guzzle, Go ve C# kodlarına dönüştürün.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs">
          <span className="font-bold text-slate-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Örnekler:
          </span>
          <button
            type="button"
            onClick={() => loadSample(DEFAULT_CURL)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-brand-blue cursor-pointer font-bold"
          >
            JSON POST + Bearer Auth
          </button>
          <button
            type="button"
            onClick={() => loadSample(`curl 'https://api.github.com/users/tayfuntasdemir' -H 'User-Agent: Mozilla/5.0'`)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-brand-blue cursor-pointer font-bold"
          >
            GitHub GET API
          </button>
          <button
            type="button"
            onClick={() => loadSample(`curl -X DELETE 'https://api.example.com/items/42' -H 'X-API-Key: secret123'`)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-brand-blue cursor-pointer font-bold"
          >
            DELETE İstek
          </button>
        </div>

        {/* Main 2-Column Split: Input cURL & Output Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Column: cURL Input */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4 flex flex-col h-full">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-brand-blue" />
                  cURL Komutunuzu Yapıştırın
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTestRequest}
                    disabled={isSending}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>Test Et (Çalıştır)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurlInput('')}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Temizle"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {parseError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl">
                  {parseError}
                </div>
              )}

              <div className="flex-1 min-h-[340px]">
                <textarea
                  value={curlInput}
                  onChange={(e) => setCurlInput(e.target.value)}
                  placeholder="curl 'https://api.example.com/data' -H '...' --data '...'"
                  className="w-full h-full min-h-[340px] p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 select-all resize-y leading-relaxed"
                />
              </div>

              {/* Live Test Response Display */}
              {testResponse && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Canlı İstek Yanıtı:</span>
                  <pre className="font-mono text-xs text-cyan-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {testResponse}
                  </pre>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Converted Target Code */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4 flex flex-col h-full">
              
              {/* Target Language Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                {[
                  { id: 'fetch', label: 'JS Fetch' },
                  { id: 'axios', label: 'Axios' },
                  { id: 'python', label: 'Python (Requests)' },
                  { id: 'php', label: 'PHP (Guzzle)' },
                  { id: 'go', label: 'Go' },
                  { id: 'csharp', label: 'C# (.NET)' },
                  { id: 'java', label: 'Java' },
                  { id: 'rust', label: 'Rust' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLang(lang.id as TargetLanguage)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedLang === lang.id
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-brand-blue'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Code Display Area */}
              <div className="flex-1 min-h-[340px] relative">
                <pre className="w-full h-full min-h-[340px] p-4 font-mono text-xs sm:text-sm bg-slate-900 text-cyan-300 rounded-2xl border border-slate-800 overflow-x-auto overflow-y-auto whitespace-pre leading-relaxed select-all">
                  {generatedCode || '// cURL komutu bekleniyor...'}
                </pre>

                {generatedCode && (
                  <button
                    type="button"
                    onClick={copyCode}
                    className={`absolute right-4 top-4 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copied ? 'bg-emerald-600 text-white' : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                  </button>
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
