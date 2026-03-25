import { useEffect } from "react";

interface DocumentHeadOptions {
  title: string;
  description?: string;
}

/**
 * Sets <title> and <meta name="description"> for the current page.
 * Restores defaults on unmount.
 */
export function useDocumentHead({ title, description }: DocumentHeadOptions) {
  useEffect(() => {
    const prevTitle = document.title;

    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    const prevDesc = metaDesc?.content ?? "";

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.content = prevDesc;
    };
  }, [title, description]);
}
