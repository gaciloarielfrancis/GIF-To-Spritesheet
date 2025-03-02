export async function FileToArrayBuffer(file: File): Promise<Uint8Array> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
        }
        reader.readAsArrayBuffer(file);
    });
}

export function Uint8ArrayToBase64(uint8Array: Uint8Array) {
    let binaryString = "";
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binaryString);
}