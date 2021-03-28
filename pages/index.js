import Link from 'next/link'
export default function Home() {
  return (
    <div>
      <Link href="/category/1">
        <a>
          <div class="w-full shadow p-3 bg-white flex">
            <div class="p-3">
              <img src="https://www.pngrepo.com/download/2880/chat-bubbles-with-ellipsis.png" class="w-12 opacity-70"/>
            </div>
            <div class="flex items-stretch flex-1 pl-2">
              <div class="self-center leading-tight">
                <span class="font-bold">General</span><br />
                <span class="text-gray-700 text-sm">
                  Any discussion that doesn't fit into any other category goes here. An all around hangout category.
                </span>
              </div>
            </div>
            <div class="flex items-stretch">
              <Link href="/thread/2">
                <a class="self-center flex">
                  <img
                    src="https://cdn.discordapp.com/avatars/165170547192233985/a7b323393549305ada28dd83982643c4.png?size=128"
                    class="w-10 rounded-full"
                  />
                  <div class="leading-none text-sm self-center pl-2 pr-4">
                    Hello!<br />
                    <span class="text-xs text-gray-600">
                      by zenternal &bull; 1 hour ago
                    </span>
                  </div>
                </a>
              </Link>
            </div>
          </div>
        </a>
      </Link>
    </div>
  )
}
