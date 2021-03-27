import Link from 'next/link'

export default function NavigationItem(props){
    return(
        <Link
            href={props.link}
        >
            <a class="py-2 px-4 text-semibold mr-2 hover:bg-black hover:bg-opacity-5 transition duration-200 ease-in-out">
                {props.name}
            </a>
        </Link>
    )   
}