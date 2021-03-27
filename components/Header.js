import NavigationItem from '@/components/NavigationItem'

export default function Header(){
    return(
        <div class="flex w-full p-10 container mx-auto">
            <div class="flex font-bold">zen's forum system</div>
            <div class="text-right flex-1">
                <NavigationItem name="Home" link="/"/>
                <button class="bg-red-400 py-1 px-3 rounded text-white">Login / Register</button>
            </div>
        </div>
    )
}