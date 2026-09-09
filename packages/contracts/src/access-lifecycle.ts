/** Auth surfaces are views, not API operation identifiers. */
export const accessSurfaces = [
 ['auth-01','Wej\u015bcie','Entry'],['auth-02','Logowanie','Sign in'],
 ['auth-03','Metoda rejestracji','Registration method'],['auth-04','Rejestracja e-mail','Email registration'],
 ['auth-05','Powr\u00f3t OAuth','OAuth callback'],['auth-06','Weryfikacja e-mail','Email verification'],
 ['auth-07','Identyfikacja firmy','Company identity'],['auth-08','Wyszukiwanie firmy','Company lookup'],
 ['auth-09','Przegl\u0105d danych firmy','Review company'],['auth-10','Firma: wpis r\u0119czny','Manual company'],
 ['auth-11','Firma ju\u017c zarejestrowana','Existing company'],['auth-12','Zgody i dokumenty','Consents'],
 ['auth-13','Przetwarzanie rejestracji','Completing registration'],['auth-14','Rejestracja zako\u0144czona','Registration completed'],
 ['auth-15','Zaproszenie','Invitation'],['auth-16','Weryfikacja MFA','MFA verification'],
 ['auth-17','Konfiguracja MFA','MFA enrollment'],['auth-18','Odzyskiwanie has\u0142a','Password recovery'],
 ['auth-19','Instrukcje odzyskiwania','Recovery instructions'],['auth-20','Nowe has\u0142o','New password'],
 ['auth-21','Rozwi\u0105zywanie dost\u0119pu','Resolve access'],['auth-22','Wyb\u00f3r organizacji','Choose organization'],
 ['auth-23','Wyb\u00f3r workspace','Choose workspace'],['auth-24','Ponowne uwierzytelnienie','Reauthenticate'],
 ['auth-25','Wylogowywanie','Signing out'],['auth-26','Wylogowano','Signed out'],
 ['auth-27','Us\u0142uga niedost\u0119pna','Service unavailable'],['auth-28','Dost\u0119p zablokowany','Access blocked'],
 ['auth-29','Wej\u015bcie do aplikacji','Enter application'],
] as const;
export type AccessSurfaceId = typeof accessSurfaces[number][0];
export type CompanyProfile = { legalName:string; vatId:string; country:'PL'; street:string; city:string; postalCode:string };
export function normalizeNip(value:string):string { return value.replace(/[\s-]/g,''); }
export function isValidNip(value:string):boolean {
 const n=normalizeNip(value); if(!/^\d{10}$/.test(n)||/^(\d)\1{9}$/.test(n))return false;
 const sum=[6,5,7,2,3,4,5,6,7].reduce((v,w,i)=>v+w*Number(n[i]),0)%11;
 return sum!==10&&sum===Number(n[9]);
}
export type LegalDocument = { id:'terms'|'privacy'; version:string; url:string; required:boolean };
export type AccessLifecycleStatus = {
 readonly email:string; readonly emailVerified:boolean; readonly userId:string;
 readonly company:{ readonly version:number; readonly values:CompanyProfile; readonly source:'manual' }|null;
 readonly documents:readonly LegalDocument[]; readonly documentsConfigured:boolean;
 readonly acceptedDocuments:readonly {id:string;version:string;acceptedAt:string}[];
 readonly completedAt:string|null; readonly canEditCompany:boolean;
 readonly integrationCount:number; readonly readySourceCount:number; readonly lastSyncAt:string|null;
 readonly mailAvailable:boolean;
};
