export namespace sqlRegEx {
    export namespace quote {
        let regEx: RegExp;
        let sqlSafe: string;
    }
    export namespace doubleQuote {
        let regEx_1: RegExp;
        export { regEx_1 as regEx };
        let sqlSafe_1: string;
        export { sqlSafe_1 as sqlSafe };
    }
    export namespace backslash {
        let regEx_2: RegExp;
        export { regEx_2 as regEx };
        let sqlSafe_2: string;
        export { sqlSafe_2 as sqlSafe };
    }
    export namespace controlChars {
        let regEx_3: RegExp;
        export { regEx_3 as regEx };
        let sqlSafe_3: string;
        export { sqlSafe_3 as sqlSafe };
    }
    export namespace _null {
        let regEx_4: RegExp;
        export { regEx_4 as regEx };
        let sqlSafe_4: string;
        export { sqlSafe_4 as sqlSafe };
    }
    export { _null as null };
    export namespace backSpace {
        let regEx_5: RegExp;
        export { regEx_5 as regEx };
        let sqlSafe_5: string;
        export { sqlSafe_5 as sqlSafe };
    }
    export namespace tab {
        let regEx_6: RegExp;
        export { regEx_6 as regEx };
        let sqlSafe_6: string;
        export { sqlSafe_6 as sqlSafe };
    }
    export namespace cr {
        let regEx_7: RegExp;
        export { regEx_7 as regEx };
        let sqlSafe_7: string;
        export { sqlSafe_7 as sqlSafe };
    }
    export namespace newline {
        let regEx_8: RegExp;
        export { regEx_8 as regEx };
        let sqlSafe_8: string;
        export { sqlSafe_8 as sqlSafe };
    }
    export namespace formfeed {
        let regEx_9: RegExp;
        export { regEx_9 as regEx };
        let sqlSafe_9: string;
        export { sqlSafe_9 as sqlSafe };
    }
    export namespace x1a {
        let regEx_10: RegExp;
        export { regEx_10 as regEx };
        let sqlSafe_10: string;
        export { sqlSafe_10 as sqlSafe };
    }
}
export namespace numRegEx {
    namespace digits {
        let regEx_11: RegExp;
        export { regEx_11 as regEx };
    }
    namespace number {
        let regEx_12: RegExp;
        export { regEx_12 as regEx };
    }
}
export namespace dateRegEx {
    namespace yyyymmdd {
        let regEx_13: RegExp;
        export { regEx_13 as regEx };
    }
    namespace yyyymmddhhmmss {
        let regEx_14: RegExp;
        export { regEx_14 as regEx };
    }
    namespace yyyymmddhhmmssTZ {
        let regEx_15: RegExp;
        export { regEx_15 as regEx };
    }
    namespace yyyymmddZhhmmss {
        let regEx_16: RegExp;
        export { regEx_16 as regEx };
    }
}
//# sourceMappingURL=sql-regex.d.ts.map