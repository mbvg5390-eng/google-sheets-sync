import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Table } from "lucide-react";
import { toast } from "sonner";

interface SheetRow {
  [key: string]: string;
}

export default function Home() {
  const [sheetId, setSheetId] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [data, setData] = useState<SheetRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSheetData = async () => {
    if (!sheetId.trim()) {
      toast.error("الرجاء إدخال معرف جوجل شيت");
      return;
    }

    setLoading(true);
    try {
      // استخدام Google Sheets API العامة (للملفات المنشورة)
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
      
      const response = await fetch(url);
      const text = await response.text();
      
      // إزالة البادئة من الاستجابة
      const jsonText = text.substring(47).slice(0, -2);
      const json = JSON.parse(jsonText);
      
      const table = json.table;
      const cols = table.cols.map((col: any) => col.label || `Column ${col.id}`);
      const rows = table.rows.map((row: any) => {
        const rowData: SheetRow = {};
        row.c.forEach((cell: any, index: number) => {
          rowData[cols[index]] = cell?.v?.toString() || "";
        });
        return rowData;
      });

      setHeaders(cols);
      setData(rows);
      toast.success("تم تحميل البيانات بنجاح!");
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      toast.error("فشل تحميل البيانات. تأكد من أن الملف منشور للعامة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefresh && sheetId) {
      const interval = setInterval(() => {
        fetchSheetData();
      }, 5000); // تحديث كل 5 ثواني

      return () => clearInterval(interval);
    }
  }, [autoRefresh, sheetId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Table className="w-10 h-10 text-indigo-600" />
            موقع متزامن مع جوجل شيت
          </h1>
          <p className="text-gray-600">اعرض بيانات جوجل شيت بشكل مباشر ومتزامن</p>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>إعدادات الاتصال</CardTitle>
            <CardDescription>أدخل معلومات جوجل شيت للاتصال</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sheetId">معرف جوجل شيت (Sheet ID)</Label>
                <Input
                  id="sheetId"
                  placeholder="مثال: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-gray-500">
                  يمكنك الحصول عليه من رابط الملف بين /d/ و /edit
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetName">اسم الورقة (Sheet Name)</Label>
                <Input
                  id="sheetName"
                  placeholder="Sheet1"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={fetchSheetData} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    تحميل البيانات
                  </>
                )}
              </Button>

              <Button
                variant={autoRefresh ? "destructive" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "إيقاف التحديث التلقائي" : "تفعيل التحديث التلقائي"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {data.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>البيانات المعروضة</CardTitle>
              <CardDescription>
                {data.length} صف · {autoRefresh && "يتم التحديث تلقائياً كل 5 ثواني"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-50">
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="border border-gray-300 px-4 py-2 text-gray-800"
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && data.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <Table className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">لا توجد بيانات لعرضها</p>
              <p className="text-gray-400 text-sm mt-2">
                أدخل معرف جوجل شيت واضغط على "تحميل البيانات"
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">ملاحظة مهمة</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 space-y-2">
            <p>• يجب نشر ملف جوجل شيت للعامة حتى يعمل الموقع</p>
            <p>• اذهب إلى ملف جوجل شيت → ملف → مشاركة → نشر على الويب</p>
            <p>• معرف الملف موجود في الرابط بين /d/ و /edit</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
