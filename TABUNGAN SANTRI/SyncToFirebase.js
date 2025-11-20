/**
 * CONFIGURATION
 * Replace these values with your Firebase project details.
 */
const FIREBASE_CONFIG = {
    projectId: "wali-santri-app-ddfd3", // e.g., "wali-santri-app"
    email: "firebase-adminsdk-fbsvc@wali-santri-app-ddfd3.iam.gserviceaccount.com",   // e.g., "firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com"
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDdxlPTSjDIg5ak\nxAZQ9RfNT7XaZ09hr8sPqMuqlVkTljXmhrNWcu366dR3NrRJKJpZ4fc6iERv0qBw\nCc6HeKZym4173aXOAVJdgjf4CxavETrANzllb+jskntyZMsMUPVHVAW0x/SUhesK\nqsyxFiikOYP6C6UDmHTPxlGG4h7kFuk/2d+RpapXWlM2DF3R+vX7DLjODB0w37nz\nDy2Vg7pYPjnPczdQWb+mmShDuUn/TnaMH3hFMZrUaCs4lqy06ZoS3++v/ZOejOut\n/iPXRKYFhqq/TbBb/v7Tgt3hx1TAEf3a/U/a/viXq3ZySbDs0fLbJXvlnCjCD87M\n4xPBzo3ZAgMBAAECggEACsJ9rGeB8qaEu2l5y3l6rka+4lHnFWyZn+C/Ad+VVuiP\npKe2IXx5vJXV7bNBH7gJNhFrJOM528mGqGznYOX7AF446PCt487nW7tOwxlpoDSI\nKs17GsdpT/oC5H/MpKQ0ZEGotbbKUF7ncojrHa/fKKmUNEBWoRQnXbHH4JENsd/u\nEfXvc4LbzQ7ooyk1gd9fgH95OKS6wjQhUhGxUti8OM9wYrgmiHcRTjmLZ8xlzM56\naHS7VDycRUV2YvXOTVVvYf17V/UghUIGdS5J/fIDL31FqMWiwsDo2EVZfGitbpaZ\n6UwltkCe7KXqogcW0DMZhhVDeMZlHSbmJF1nAg/9kQKBgQDuUou+dy4YxwN3FZDw\nbKxKtz+YHktUCHtQHUbfY9Disr4fzpF7ku9Sb/AhCY7upEsvuk9+PeuJpJj5bc1H\nhjXa+X3t0Ij5j2z4iNXBI9uFEQ3vyfnoNqR1Jz4b+y2/uQl/O511eqM/S4MBcwh2\n/q1NfAr/xiEKhAaT6z4M6ddH0QKBgQDuOY9uoZzfA3xVM8Rolq5mCMwskBNHYwjW\nocKZAeEhsb7YbFfVy+uG51jlyW70rObmFsUx+ieu3sZV4MqaGSLGrvS+szTBzSQZ\nVPE4cWj6MB/0Ag4BQidGBIj4oOnD8efv9lqCHMgKEf2KkaOa/DCGE98XoUnAsWO2\nbUzgKP3viQKBgQCkJk8CfWxOvKTyXPRb5T42qEkxKYyQ8Naes8uhCktSGfNCTTF/\ngBE/IsKuvrqoPJlc4mLmfRfC0pBbHPoLjbGChd3q83ulCNjxxq4UPfJxkPGce+2Z\nuClGWCU7eKJmL7kO3azywem3KvetA+KMs5YCjLG2wmz3pUAymhE/K8GQQQJ/Cjxu\n7VIEa5C6xu5yggv3cmruWvvV2DtpJc/NjMWH5uq8SJBfNdCNTj6ikz0Uh27mfPx9\nfKhDDECGRSpjijuKQv9BhPAuVCV8Z5o+wy4cVKO8u79a2rL8/QU03XoMkV7TmHv9\nZ5nU/pnHSyz22rH7Y8d2zo0fnigBINWReBBK2QKBgHN7nCUBz//nZZbk6DMFwar4\n5R42zSAbOhGeaaogZfN9uk2qeCulikN5VV1l8xJbD7c/JGH0oE/HJCgDKeIk8qOD\nZc5exifhu1fK8rXpjbEr8F+qpZCnkjNggtMqH8CveJQnMZ6yvpzl1lfhtgWlcWiV\n7TwP+3VuShtmMwPj7/hk\n-----END PRIVATE KEY-----\n"
};

/**
 * FIRESTORE HELPER CLASS
 * Handles authentication and CRUD operations with Firestore via REST API.
 */
class Firestore {
    constructor(config) {
        this.projectId = config.projectId;
        this.email = config.email;
        this.privateKey = config.privateKey;
        this.token = null;
    }

    getAccessToken() {
        if (this.token) return this.token;

        const header = {
            alg: "RS256",
            typ: "JWT"
        };

        const now = Math.floor(Date.now() / 1000);
        const claim = {
            iss: this.email,
            scope: "https://www.googleapis.com/auth/datastore",
            aud: "https://oauth2.googleapis.com/token",
            exp: now + 3600,
            iat: now
        };

        const toSign = Utilities.base64EncodeWebSafe(JSON.stringify(header)) + "." + Utilities.base64EncodeWebSafe(JSON.stringify(claim));
        const signatureBytes = Utilities.computeRsaSha256Signature(toSign, this.privateKey);
        const signature = Utilities.base64EncodeWebSafe(signatureBytes);

        const jwt = toSign + "." + signature;

        const options = {
            method: "post",
            payload: {
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: jwt
            }
        };

        const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", options);
        const data = JSON.parse(response.getContentText());
        this.token = data.access_token;
        return this.token;
    }

    updateDocument(collection, id, data) {
        const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collection}/${id}?updateMask.fieldPaths=saldo&updateMask.fieldPaths=limitHarian&updateMask.fieldPaths=riwayat&updateMask.fieldPaths=updatedAt`;

        const firestoreData = this._toFirestoreValue(data);

        const payload = {
            fields: firestoreData.fields
        };

        const options = {
            method: "patch",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + this.getAccessToken()
            },
            payload: JSON.stringify(payload)
        };

        try {
            UrlFetchApp.fetch(url, options);
            Logger.log(`Successfully updated document ${collection}/${id}`);
        } catch (e) {
            Logger.log(`Error updating document ${collection}/${id}: ${e.message}`);
            if (e.message.includes("NOT_FOUND")) {
                this.createDocument(collection, id, data);
            }
        }
    }

    createDocument(collection, id, data) {
        const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collection}?documentId=${id}`;
        const firestoreData = this._toFirestoreValue(data);

        const options = {
            method: "post",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + this.getAccessToken()
            },
            payload: JSON.stringify(firestoreData)
        };

        UrlFetchApp.fetch(url, options);
        Logger.log(`Successfully created document ${collection}/${id}`);
    }

    _toFirestoreValue(value) {
        if (value === null) return { nullValue: null };
        if (typeof value === 'boolean') return { booleanValue: value };
        if (typeof value === 'number') {
            if (Number.isInteger(value)) return { integerValue: value };
            return { doubleValue: value };
        }
        if (typeof value === 'string') return { stringValue: value };
        if (value instanceof Date) return { timestampValue: value.toISOString() };
        if (Array.isArray(value)) {
            return { arrayValue: { values: value.map(v => this._toFirestoreValue(v)) } };
        }
        if (typeof value === 'object') {
            const fields = {};
            for (const k in value) {
                fields[k] = this._toFirestoreValue(value[k]);
            }
            return { mapValue: { fields: fields } };
        }
        return { stringValue: String(value) };
    }
}

/**
 * SYNC FUNCTION
 * Reads SALDO, DATA SANTRI, TOP-UP, and PENARIKAN sheets and updates Firestore.
 */
function syncTabunganToFirebase() {
    const firestore = new Firestore(FIREBASE_CONFIG);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const saldoSheet = ss.getSheetByName('SALDO');
    const dataSantriSheet = ss.getSheetByName('DATA SANTRI');
    const topupSheet = ss.getSheetByName('TOP-UP');
    const penarikanSheet = ss.getSheetByName('PENARIKAN');

    if (!saldoSheet || !dataSantriSheet) {
        Logger.log("Required sheets not found");
        return;
    }

    // Get Saldo Data
    const saldoData = saldoSheet.getDataRange().getValues();
    const saldoMap = {};
    for (let i = 1; i < saldoData.length; i++) {
        saldoMap[saldoData[i][0]] = saldoData[i][2] || 0;
    }

    // Get Limit Harian
    const santriData = dataSantriSheet.getDataRange().getValues();
    const limitMap = {};
    for (let i = 1; i < santriData.length; i++) {
        limitMap[santriData[i][0]] = santriData[i][2] || 0;
    }

    // Get History
    const historyMap = {};

    // Process Top-Up
    if (topupSheet && topupSheet.getLastRow() > 1) {
        const topupData = topupSheet.getDataRange().getValues();
        for (let i = 1; i < topupData.length; i++) {
            const nis = topupData[i][1];
            if (!historyMap[nis]) historyMap[nis] = [];
            historyMap[nis].push({
                type: 'TOP-UP',
                jumlah: topupData[i][3],
                tanggal: new Date(topupData[i][6]),
                keterangan: topupData[i][7] || ''
            });
        }
    }

    // Process Penarikan
    if (penarikanSheet && penarikanSheet.getLastRow() > 1) {
        const penarikanData = penarikanSheet.getDataRange().getValues();
        for (let i = 1; i < penarikanData.length; i++) {
            const nis = penarikanData[i][1];
            if (!historyMap[nis]) historyMap[nis] = [];
            historyMap[nis].push({
                type: 'PENARIKAN',
                jumlah: penarikanData[i][3],
                tanggal: new Date(penarikanData[i][6]),
                keterangan: penarikanData[i][7] || ''
            });
        }
    }

    // Sync per Santri
    for (let i = 1; i < santriData.length; i++) {
        const nis = santriData[i][0];
        if (!nis) continue;

        // Sort and limit history
        let history = historyMap[nis] || [];
        history.sort((a, b) => b.tanggal - a.tanggal);
        history = history.slice(0, 20); // Keep last 20 transactions

        const payload = {
            saldo: saldoMap[nis] || 0,
            limitHarian: limitMap[nis] || 0,
            riwayat: history,
            updatedAt: new Date()
        };

        firestore.updateDocument('tabungan', String(nis), payload);
    }
}

/**
 * TRIGGER SETUP
 * Run this once to set up the time-driven trigger.
 */
function setupTrigger() {
    ScriptApp.newTrigger('syncTabunganToFirebase')
        .timeBased()
        .everyHours(1)
        .create();
}
