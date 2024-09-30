
export class Proforma{
    suitForPartition="SUIT FOR PARTITION AND SEPERATE POSESSION"
    suitForDeclaration="SUIT FOR DECLARATION AND RECOVERY OF POSESSION"
    suitForInjunction="SUIT FOR PERPETUAL INJUNCTION"
    descriptionOfplaintiffs="The address and description of the defendant is the same as shown in the cause title for the purpose of issue of all summons, notices, process etc.,."
    descriptionOfDefendants="The address for service of summons notices, process  on the Plaintiff is the same as shown in the above cause title and also that of Their counsel V. MAHESHWAR Advocate, Sangareddy."
    plaintRule="PLAINT FILED UNDER ORDER VII RULE 1 & 2 R/W SEC. 26 OF C.P.C"
    limitation="That the suit is filed with in time."
    declaration="The plaintiff hereby declares that he was not filed any suit or proceeding before any court or authority except the present suit."
    notice_content:string[]=["Whereas the above Named Petitioner_________ has made an Application to this court.","You are hereby wanted to appear in this court in person, or by a pleader duly instructed on the ___ day of _________ 2023 at 10:30 a.m. in the forenoon to show Cause of against the Application, failing which the said Application will be heard and determined exparty. ",
        "Given under my hand and seal of the Court this______day of ____________2023"]
}

export const Parastyle={
    NORMAL:'content',
    BOLD:'bold',
    UNDERLINED:'underline' 
}
export declare const NumStyle:{
    readonly ALPHABETICAL:'alphalist';
    readonly CONTENT:'roman';
    readonly LIST:'num';
    readonly PARA:'para';
}

