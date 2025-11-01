import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, AlertCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Excuse {
  id: number;
  text: string;
}

export default function Home() {
  const [sheetId, setSheetId] = useState("1mw5z6UWdk3GZHiprpr6-oFSVTAje3bE8KADSf3SMnaM");
  const [sheetName, setSheetName] = useState("الورقة1");
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchExcuses = async () => {
    if (!sheetId.trim()) {
      toast.error("الرجاء إدخال معرف جوجل شيت");
      return;
    }

    setLoading(true);
    try {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      
      const response = await fetch(url);
      const text = await response.text();
      
      // إزالة البادئة من الاستجابة
      const jsonText = text.substring(47).slice(0, -2);
      const json = JSON.parse(jsonText);
      
      const table = json.table;
      const rows = table.rows.map((row: any, index: number) => ({
        id: index + 1,
        text: row.c[0]?.v?.toString() || "",
      })).filter((excuse: Excuse) => excuse.text.trim() !== "");

      setExcuses(rows);
      toast.success("تم تحميل التعذرات بنجاح!");
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      toast.error("فشل تحميل البيانات. تأكد من أن الملف منشور للعامة");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ التعذر!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (autoRefresh && sheetId) {
      const interval = setInterval(() => {
        fetchExcuses();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, sheetId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6" dir="rtl">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <AlertCircle className="w-10 h-10 text-red-600" />
            قائمة التعذرات الممنوعة
          </h1>
          <p className="text-gray-600">التعذرات التي لا يجوز استخدامها من قبل الباحث</p>
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
                  placeholder="معرف الملف"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetName">اسم الورقة (Sheet Name)</Label>
                <Input
                  id="sheetName"
                  placeholder="الورقة1"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={fetchExcuses} disabled={loading} className="bg-red-600 hover:bg-red-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    تحميل التعذرات
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

        {excuses.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>قائمة التعذرات</CardTitle>
              <CardDescription>
                {excuses.length} تعذر · {autoRefresh && "يتم التحديث تلقائياً كل 5 ثواني"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {excuses.map((excuse) => (
                  <div
                    key={excuse.id}
                    className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex-shrink-0 pt-1">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{excuse.text}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(excuse.text, excuse.id)}
                      className="flex-shrink-0 p-2 hover:bg-red-200 rounded-lg transition-colors"
                      title="نسخ النص"
                    >
                      {copiedId === excuse.id ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && excuses.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">لا توجد تعذرات لعرضها</p>
              <p className="text-gray-400 text-sm mt-2">
                أدخل معرف جوجل شيت واضغط على "تحميل التعذرات"
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
            <p>• يمكنك نسخ أي تعذر بالضغط على أيقونة النسخ</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
