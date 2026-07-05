"use client"; 

import { useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"; 
import { Label } from "@/components/ui/label"; 
import { Plus, Download, Power, PowerOff, Trash2 } from "lucide-react"; 

interface Table { 
  id: string; 
  label: string; 
  is_active: boolean; 
  qr_url: string | null; 
  created_at: string; 
} 

interface TablesClientProps { 
  initialTables: Table[]; 
  slug: string; 
} 

export function TablesClient({ initialTables, slug }: TablesClientProps) { 
  const router = useRouter(); 
  const [tables, setTables] = useState<Table[]>(initialTables); 
  const [open, setOpen] = useState(false); 
  const [label, setLabel] = useState(""); 
  const [creating, setCreating] = useState(false); 
  const [error, setError] = useState(""); 

  async function handleCreate(e: React.FormEvent) { 
    e.preventDefault(); 
    setCreating(true); 
    setError(""); 
    const res = await fetch("/api/admin/tables", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ label }), 
    }); 
    const data = await res.json(); 
    if (!res.ok) { 
      setError(data.error ?? "Failed to create table."); 
      setCreating(false); 
      return; 
    } 
    setTables((prev) => [...prev, data.table]); 
    setLabel(""); 
    setOpen(false); 
    setCreating(false); 
  } 

  async function toggleActive(table: Table) { 
    const res = await fetch(`/api/admin/tables/${table.id}`, { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ is_active: !table.is_active }), 
    }); 
    if (res.ok) { 
      setTables((prev) => prev.map((t) => t.id === table.id ? { ...t, is_active: !t.is_active } : t ) ); 
    } 
  } 

  async function deleteTable(tableId: string) { 
    if (!confirm("Delete this table? This cannot be undone.")) return; 
    const res = await fetch(`/api/admin/tables/${tableId}`, { 
      method: "DELETE", 
    }); 
    if (res.ok) { 
      setTables((prev) => prev.filter((t) => t.id !== tableId)); 
    } 
  } 

  async function downloadQR(tableId: string, label: string) { 
    const res = await fetch(`/api/admin/tables/${tableId}/qr`); 
    const data = await res.json(); 
    if (!data.url) return; 
    const a = document.createElement("a"); 
    a.href = data.url; 
    a.download = `quickr-qr-${label.replace(/\s+/g, "-").toLowerCase()}.png`; 
    a.click(); 
  } 

  return ( 
    <div className="space-y-4 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm sm:p-5"> 
      {/* Create button */} 
      <div> 
        <Dialog open={open} onOpenChange={setOpen}> 
          <DialogTrigger asChild> 
            <Button> 
              <Plus size={16} className="mr-2" /> Add table 
            </Button> 
          </DialogTrigger> 
          <DialogContent className="sm:max-w-sm"> 
            <DialogHeader> 
              <DialogTitle>Add a table</DialogTitle> 
            </DialogHeader> 
            <form onSubmit={handleCreate} className="space-y-4 mt-2"> 
              <div className="space-y-1.5"> 
                <Label htmlFor="label">Table name</Label> 
                <Input id="label" placeholder="e.g. Table 4, Counter 1, Terrace A" value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus /> 
              </div> 
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>} 
              <div className="flex gap-2 pt-1"> 
                <Button type="submit" disabled={creating} className="flex-1"> 
                  {creating ? "Creating…" : "Create table"} 
                </Button> 
                <Button type="button" variant="outline" onClick={() => setOpen(false)} > 
                  Cancel 
                </Button> 
              </div> 
            </form> 
          </DialogContent> 
        </Dialog> 
      </div> 

      {/* Tables list */} 
      {tables.length === 0 ? ( 
        <div className="rounded-xl border-2 border-dashed border-[#630102]/15 p-12 text-center"> 
          <p className="text-sm text-[#630102]/50">No tables yet.</p> 
          <p className="mt-1 text-xs text-[#630102]/35"> Add your first table to generate a QR code. </p> 
        </div> 
      ) : ( 
        <div className="overflow-hidden rounded-xl border border-[#630102]/10"> 
          <div className="overflow-x-auto"> 
            <table className="min-w-[680px] w-full text-sm"> 
              <thead> 
                <tr className="border-b border-[#630102]/10 bg-[#630102]/[0.03]"> 
                  <th className="px-4 py-3 text-left font-medium text-[#630102]/65"> Table </th> 
                  <th className="px-4 py-3 text-left font-medium text-[#630102]/65"> Status </th> 
                  <th className="px-4 py-3 text-right font-medium text-[#630102]/65"> Actions </th> 
                </tr> 
              </thead> 
              <tbody className="divide-y divide-[#630102]/8"> 
                {tables.map((table) => ( 
                  <tr key={table.id} className="bg-[#EDEBDE] hover:bg-[#630102]/[0.03]"> 
                    <td className="px-4 py-3 font-medium text-[#1a0000]"> {table.label} </td> 
                    <td className="px-4 py-3"> 
                      <Badge variant={table.is_active ? "default" : "secondary"} className={ table.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "" } > 
                        {table.is_active ? "Active" : "Inactive"} 
                      </Badge> 
                    </td> 
                    <td className="px-4 py-3"> 
                      <div className="flex items-center justify-end gap-2"> 
                        <Button size="sm" variant="outline" onClick={() => downloadQR(table.id, table.label)} title="Download QR code" > 
                          <Download size={14} className="mr-1.5" /> QR code 
                        </Button> 
                        <Button size="sm" variant="outline" onClick={() => toggleActive(table)} title={table.is_active ? "Deactivate" : "Activate"} > 
                          {table.is_active ? ( <PowerOff size={14} /> ) : ( <Power size={14} /> )} 
                        </Button> 
                        <Button size="sm" variant="outline" onClick={() => deleteTable(table.id)} className="text-red-600 hover:text-red-700 hover:border-red-200" title="Delete table" > 
                          <Trash2 size={14} /> 
                        </Button> 
                      </div> 
                    </td> 
                  </tr> 
                ))} 
              </tbody> 
            </table> 
          </div> 
        </div> 
      )} 

      {/* Moved down out of the ternary operator statement to resolve syntax breaks */}
      <p className="mt-4 text-xs text-[#630102]/40"> 
        {tables.length} table{tables.length !== 1 ? "s" : ""} ·{" "} 
        {tables.filter((t) => t.is_active).length} active 
      </p> 
    </div> 
  ); 
}









// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Plus, Download, Power, PowerOff, Trash2 } from "lucide-react";

// interface Table {
//   id: string;
//   label: string;
//   is_active: boolean;
//   qr_url: string | null;
//   created_at: string;
// }

// interface TablesClientProps {
//   initialTables: Table[];
//   slug: string;
// }

// export function TablesClient({ initialTables, slug }: TablesClientProps) {
//   const router = useRouter();
//   const [tables, setTables] = useState<Table[]>(initialTables);
//   const [open, setOpen] = useState(false);
//   const [label, setLabel] = useState("");
//   const [creating, setCreating] = useState(false);
//   const [error, setError] = useState("");

//   async function handleCreate(e: React.FormEvent) {
//     e.preventDefault();
//     setCreating(true);
//     setError("");

//     const res = await fetch("/api/admin/tables", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ label }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setError(data.error ?? "Failed to create table.");
//       setCreating(false);
//       return;
//     }

//     setTables((prev) => [...prev, data.table]);
//     setLabel("");
//     setOpen(false);
//     setCreating(false);
//   }

//   async function toggleActive(table: Table) {
//     const res = await fetch(`/api/admin/tables/${table.id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ is_active: !table.is_active }),
//     });

//     if (res.ok) {
//       setTables((prev) =>
//         prev.map((t) =>
//           t.id === table.id ? { ...t, is_active: !t.is_active } : t
//         )
//       );
//     }
//   }

//   async function deleteTable(tableId: string) {
//     if (!confirm("Delete this table? This cannot be undone.")) return;

//     const res = await fetch(`/api/admin/tables/${tableId}`, {
//       method: "DELETE",
//     });

//     if (res.ok) {
//       setTables((prev) => prev.filter((t) => t.id !== tableId));
//     }
//   }

//   async function downloadQR(tableId: string, label: string) {
//     const res = await fetch(`/api/admin/tables/${tableId}/qr`);
//     const data = await res.json();
//     if (!data.url) return;

//     // Trigger browser asset pipeline download
//     const a = document.createElement("a");
//     a.href = data.url;
//     a.download = `quickr-qr-${label.replace(/\s+/g, "-").toLowerCase()}.png`;
//     a.click();
//   }

//   return (
//     <div>
//       {/* Create button */}
//       <div className="mb-6">
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus size={16} className="mr-2" />
//               Add table
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-sm">
//             <DialogHeader>
//               <DialogTitle>Add a table</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleCreate} className="space-y-4 mt-2">
//               <div className="space-y-1.5">
//                 <Label htmlFor="label">Table name</Label>
//                 <Input
//                   id="label"
//                   placeholder="e.g. Table 4, Counter 1, Terrace A"
//                   value={label}
//                   onChange={(e) => setLabel(e.target.value)}
//                   required
//                   autoFocus
//                 />
//               </div>

//               {error && (
//                 <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
//                   {error}
//                 </p>
//               )}

//               <div className="flex gap-2 pt-1">
//                 <Button type="submit" disabled={creating} className="flex-1">
//                   {creating ? "Creating…" : "Create table"}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Tables list */}
//       {tables.length === 0 ? (
//         <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
//           <p className="text-slate-500 text-sm">No tables yet.</p>
//           <p className="text-slate-400 text-xs mt-1">
//             Add your first table to generate a QR code.
//           </p>
//         </div>
//       ) : (
//         <div className="border rounded-xl overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b bg-slate-50">
//                 <th className="text-left px-4 py-3 font-medium text-slate-600">
//                   Table
//                 </th>
//                 <th className="text-left px-4 py-3 font-medium text-slate-600">
//                   Status
//                 </th>
//                 <th className="text-right px-4 py-3 font-medium text-slate-600">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {tables.map((table) => (
//                 <tr key={table.id} className="bg-white hover:bg-slate-50">
//                   <td className="px-4 py-3 font-medium text-slate-900">
//                     {table.label}
//                   </td>
//                   <td className="px-4 py-3">
//                     <Badge
//                       variant={table.is_active ? "default" : "secondary"}
//                       className={
//                         table.is_active
//                           ? "bg-green-100 text-green-700 hover:bg-green-100"
//                           : ""
//                       }
//                     >
//                       {table.is_active ? "Active" : "Inactive"}
//                     </Badge>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center justify-end gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => downloadQR(table.id, table.label)}
//                         title="Download QR code"
//                       >
//                         <Download size={14} className="mr-1.5" />
//                         QR code
//                       </Button>

//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => toggleActive(table)}
//                         title={table.is_active ? "Deactivate" : "Activate"}
//                       >
//                         {table.is_active ? (
//                           <PowerOff size={14} />
//                         ) : (
//                           <Power size={14} />
//                         )}
//                       </Button>

//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => deleteTable(table.id)}
//                         className="text-red-600 hover:text-red-700 hover:border-red-200"
//                         title="Delete table"
//                       >
//                         <Trash2 size={14} />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <p className="text-xs text-slate-400 mt-4">
//         {tables.length} table{tables.length !== 1 ? "s" : ""} ·{" "}
//         {tables.filter((t) => t.is_active).length} active
//       </p>
//     </div>
//   );
// }
