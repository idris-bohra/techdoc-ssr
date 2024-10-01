import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import './renderPageContent.scss'
import HoverBox from './hoverBox/hoverBox';

export default function RenderPageContent(props) {

    const { pages } = useSelector((state) => ({
        pages: state.pages,
    }))

    const [headings, setHeadings] = useState([]);
    const [htmlWithIds, setHtmlWithIds] = useState(props?.pageContent || '');
    const [innerText, setInnerText] = useState('');

    const addIdsToHeadings = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headings = Array.from(headingElements).map((heading, index) => {
            const id = `heading-${index}`;
            heading.setAttribute('id', id);
            return { id, text: heading.innerText, tag: heading.tagName.toLowerCase() };
        });
        setHeadings(headings);
        setInnerText(doc.body.innerText);
        return doc.body.innerHTML;
    };

    useEffect(() => {
        setHtmlWithIds(addIdsToHeadings(props?.pageContent));
    }, [props?.pageContent]);

    const scrollToHeading = (headingId) => {
        document.getElementById(headingId).scrollIntoView({ behavior: "smooth" });
    }

    return (
        <React.Fragment>
            {innerText?.length > 0 &&
                <div className='main-page-content d-flex flex-column justify-content-start align-items-start w-50 tiptap'>
                    <div className='mb-4 page-text-render w-100 d-flex justify-content-between align-items-center'>
                        <span className='page-name font-weight-bold mt-5 border-0 w-100 d-flex align-items-center'>{pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name}</span>
                    </div>
                    <div className="page-text-render w-100 d-flex justify-content-center">
                        <div className='w-100'><div className='page-content-body' dangerouslySetInnerHTML={{ __html: htmlWithIds }} /></div>
                        <HoverBox scrollToHeading={scrollToHeading} headings={headings} />
                    </div>
                </div>
            }
        </React.Fragment>
    )
}