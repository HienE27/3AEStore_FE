declare module '@ckeditor/ckeditor5-build-classic' {
    const ClassicEditor: any;
    export = ClassicEditor;
}

declare module '@ckeditor/ckeditor5-react' {
    import { ReactElement } from 'react';
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
    
    export interface CKEditorProps {
        disabled?: boolean;
        editor: typeof ClassicEditor;
        data?: string;
        id?: string;
        config?: any;
        onReady?: (editor: any) => void;
        onChange?: (event: any, editor: any) => void;
        onBlur?: (event: any, editor: any) => void;
        onFocus?: (event: any, editor: any) => void;
        onError?: (error: Error, details: any) => void;
    }

    export const CKEditor: (props: CKEditorProps) => ReactElement;
}
