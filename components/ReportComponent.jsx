import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from "@/components/ui/use-toast";

const ReportComponent = ({ onReportConfirmation }) => {
  const { toast } = useToast();

  const [base64Data, setBase64Data] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState("");

  function handleReportSelection(event) {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (file) {
      const validImages = ['image/jpeg', 'image/png', 'image/webp'];
      const validDocs = ['application/pdf'];

      if (!(validImages.includes(file.type) || validDocs.includes(file.type))) {
        toast({ variant: 'destructive', description: "Filetype not supported!" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Data(reader.result);
      };

      if (validImages.includes(file.type)) {
        compressImage(file, (compressedFile) => reader.readAsDataURL(compressedFile));
      } else {
        reader.readAsDataURL(file);
      }
    }
  }

  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.1);
        const byteString = atob(dataURL.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        callback(new File([ab], file.name, { type: 'image/jpeg' }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function extractDetails() {
    if (!base64Data) {
      toast({ variant: 'destructive', description: "Upload a valid report!" });
      return;
    }
    setIsLoading(true);
    const response = await fetch("api/extractreportgemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64: base64Data }),
    });

    if (response.ok) {
      const reportText = await response.text();
      setReportData(reportText);
    }
    setIsLoading(false);
  }

  return (
    <div className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
      <fieldset className="relative grid gap-6 rounded-lg border p-4">
        <legend className="text-sm font-medium">Report</legend>
        {isLoading && (
          <div className="absolute z-10 h-full w-full bg-card/90 rounded-lg flex flex-row items-center justify-center">
            extracting...
          </div>
        )}
        <Input type='file' onChange={handleReportSelection} />
        <Button onClick={extractDetails}>1. Upload File</Button>
        <Label>Report Summary</Label>
        <Textarea
          value={reportData}
          onChange={(e) => setReportData(e.target.value)}
          placeholder="Extracted data from the report will appear here. Get better recommendations by providing additional patient history and symptoms..."
          className="min-h-72 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <Button
          variant="destructive"
          className="bg-[#D90013]"
          onClick={() => onReportConfirmation(reportData)}
        >
          2. Looks Good
        </Button>
      </fieldset>
    </div>
  );
};

export default ReportComponent;
