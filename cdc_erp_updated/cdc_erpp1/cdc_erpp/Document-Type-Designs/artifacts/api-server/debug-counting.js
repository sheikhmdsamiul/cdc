
function parseDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

function calculateAge(dob, asOf) {
  let age = asOf.getFullYear() - dob.getFullYear();
  const m = asOf.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

const children = [
  { child_id: 'CHILD-2026-00001', admission_date: '2024-04-02', current_status: 'Admitted', date_of_birth: '2012-03-18' },
  { child_id: 'CHILD-2026-00002', admission_date: '2024-08-10', current_status: 'Admitted', date_of_birth: '2011-02-12' },
  { child_id: 'CHILD-2026-00003', admission_date: '2024-01-23', current_status: 'Admitted', date_of_birth: '2013-04-27' },
  { child_id: 'CHILD-2026-00004', admission_date: '2024-04-02', current_status: 'Admitted', date_of_birth: '2010-01-10' },
  { child_id: 'CHILD-2026-00005', admission_date: '2024-06-21', current_status: 'Admitted', date_of_birth: '2014-05-23' },
  { child_id: 'CHILD-2026-00006', admission_date: '2024-11-18', current_status: 'Admitted', date_of_birth: '2011-03-05' },
  { child_id: 'CHILD-2026-00007', admission_date: '2023-07-07', current_status: 'Admitted', date_of_birth: '2008-06-01' },
  { child_id: 'CHILD-2026-00008', admission_date: '2023-03-29', current_status: 'Admitted', date_of_birth: '2008-04-27' },
  { child_id: 'CHILD-2026-00009', admission_date: '2023-04-03', current_status: 'Admitted', date_of_birth: '2008-07-02' },
];

const reportDate = new Date(2026, 4, 31); // May 31, 2026

const filtered = children.filter(child => {
  const admissionDate = parseDate(child.admission_date);
  if (!admissionDate || admissionDate > reportDate) return false;
  if (child.current_status !== 'Admitted') return false;
  return true;
});

console.log('Total Residents:', filtered.length);
filtered.forEach(c => {
  const age = calculateAge(new Date(c.date_of_birth), reportDate);
  console.log(`${c.child_id}: Age ${age}`);
});
