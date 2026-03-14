'use client'

import Link from 'next/link'

interface TrialBannerProps {
    status: string | null
    trialEnd: string | null
    tier: string | null
}

export function TrialBanner({ status, trialEnd, tier }: TrialBannerProps) {
    if (status !== 'trialing' || !trialEnd) return null

  const now = new Date()
    const end = new Date(trialEnd)
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  if (daysLeft <= 0) return null

  const urgencyColor = daysLeft <= 2
      ? 'bg-red-50 border-red-200 text-red-800'
        : daysLeft <= 4
      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
        : 'bg-blue-50 border-blue-200 text-blue-800'

  const badgeColor = daysLeft <= 2
      ? 'bg-red-100 text-red-700'
        : daysLeft <= 4
      ? 'bg-yellow-100 text-yellow-700'
        : 'bg-blue-100 text-blue-700'

  return (
        <div className={`${urgencyColor} border rounded-lg px-4 py-3 flex items-center justify-'buestew ecelni emnbt-'4
        `
        }i>m
        p o r t   L i<ndki vf rcolma s'snNeaxmte/=l"ifnlke'x
         
        iitnetmesr-fcaecnet eTrr igaalpB-a3n"n>e
        r P r o p s   { 
          < s psatna tculsa:s ssNtarmien=g{ `|$ {nbualdlg
          e C otlroira}l Etnedx:t -sxtsr ifnogn t|- sneumlilb
          o l dt ipexr-:2  sptyr-i1n gr o|u nndueldl-
          f}u
          l
          le`x}p>o
          r t   f u n c t i o nP RTOr iTaRlIBAaLn
          n e r ( {   s t a<t/ussp,a nt>r
          i a l E n d ,   t<isepra n} :c lTarsisaNlaBmaen=n"etrePxrto-pssm)  f{o
            n t -imfe d(isutma"t>u
          s   ! = =   ' t r i a{ldianygs'L e|f|t  !=t=r=i a1l E?n d')1  rdeatyu'r n:  n`u$l{ld
            a
          y s Lceofnts}t  dnaoyws `=}  nleewf tD aitne (y)o
          u r  cforneset  Pernod  t=r inaelw
            D a t e ( t r i<a/lsEpnadn)>
          
              c o n s t< /ddaiyvs>L
              e f t   =   M<aLtihn.km
                             a x ( 0 ,   M a thhr.ecfe=i"l/(u(pegnrda.dgee"t
              T i m e ( )   -  cnloaws.sgNeatmTei=m"et(e)x)t -/s m( 1f0o0n0t -*s e6m0i b*o l6d0  p*x -244 )p)y)-
              1
              . 5  ibfg -(idnadyisgLoe-f6t0 0< =t e0x)t -rwehtiutren  rnouulnld
              e
              d - lcgo nhsotv eurr:gbegn-ciynCdoilgoor- 7=0 0d atyrsaLnesfitt i<o=n -2c
              o l o r s?" 
              ' b g - r e d>-
              5 0   b o r d e rU-prgerda-d2e0 0N otwe
              x t - r e d -<8/0L0i'n
              k > 
                  :   d<a/ydsiLve>f
              t   <)=
                }4
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              
                const badgeColor = daysLeft <= 2
                    ? 'bg-red-100 text-red-700'
                    : daysLeft <= 4
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    
                      return (
                        <div className={`${urgencyColor} border rounded-lg px-4 py-3 flex items-center justify-between mb-4`}>
                              <div className="flex items-center gap-3">
                                      <span className={`${badgeColor} text-xs font-semibold px-2 py-1 rounded-full`}>
                                                PRO TRIAL
                                      </span>span>
                                      <span className="text-sm font-medium">
                                        {daysLeft === 1 ? '1 day' : `${daysLeft} days`} left in your free Pro trial
                                      </span>span>
                              </div>div>
                              <Link
                                        href="/upgrade"
                                        className="text-sm font-semibold px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                      >
                                      Upgrade Now
                              </Link>Link>
                        </div>div>
                      )
                      }</div>
