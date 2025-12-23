// Generate Member ID: AGR + 4 digits + Letter
export function generateMemberId(existingIds: string[] = []): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let attempts = 0;
  let memberId: string;

  do {
    // Generate 4 random digits
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    // Generate random letter
    const letter = letters[Math.floor(Math.random() * letters.length)];
    memberId = `AGR${digits}${letter}`;
    attempts++;
    
    if (attempts > 1000) {
      throw new Error('Unable to generate unique member ID after 1000 attempts');
    }
  } while (existingIds.includes(memberId));

  return memberId;
}


