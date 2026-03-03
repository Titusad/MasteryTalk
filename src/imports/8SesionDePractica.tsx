import svgPaths from "./svg-vuy08rdgbv";

function Container2() {
  return (
    <div className="flex-[1_0_0] h-[28px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-0 not-italic text-[#0f172b] text-[0px] text-[24px] top-0 tracking-[-0.5297px] w-[164px] whitespace-pre-wrap">
          <span className="leading-[32px]">{`inFluentia `}</span>
          <span className="font-['Inter:Light',sans-serif] font-light leading-[32px]">PRO</span>
        </p>
      </div>
    </div>
  );
}

function Container3() {
  return <div className="bg-[#e2e8f0] h-[24px] shrink-0 w-px" data-name="Container" />;
}

function Container4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[119.813px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px]">Sales pitch · Client</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[311px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container2 />
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M15 5L5 15" id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M5 5L15 15" id="Vector_2" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="flex-[1_0_0] h-[24px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[33px] not-italic text-[#45556c] text-[16px] text-center top-0 tracking-[-0.3125px]">Terminar</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[24px] relative shrink-0 w-[93.453px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Icon />
        <Text />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[64px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Button />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white h-[65px] relative shrink-0 w-[1890px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px px-[209px] relative size-full">
        <Container />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#62748e] text-[12px] top-0 w-[75px] whitespace-pre-wrap">Client · 10:23</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[78px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#0f172b] text-[16px] top-0 tracking-[-0.3125px] w-[594px] whitespace-pre-wrap">{`Good morning! I understand you're here to present your marketing automation platform. I'm interested, but I'd like to understand how this differs from what we're currently using. Can you walk me through the key benefits?`}</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-white h-[112px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-px pt-[17px] px-[25px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[136px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container9 />
        <Container10 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex h-[136px] items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[672.41px] not-italic text-[#62748e] text-[12px] text-right top-0 w-[56px] whitespace-pre-wrap">Tú · 10:24</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[78px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[16px] text-white top-0 tracking-[-0.3125px] w-[592px] whitespace-pre-wrap">Of course. Our platform is specifically designed for mid-sized companies in Latin America. The main differentiator is that we offer bilingual support and integrations with local payment processors.</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[#0f172b] h-[110px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pt-[16px] px-[24px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[134px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex h-[134px] items-start justify-end relative shrink-0 w-full" data-name="Container">
      <Container12 />
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#62748e] text-[12px] top-0 w-[75px] whitespace-pre-wrap">Client · 10:25</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[78px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#0f172b] text-[16px] top-0 tracking-[-0.3125px] w-[617px] whitespace-pre-wrap">{`That's interesting. But I'm concerned about the implementation timeline. We're a lean team and can't afford weeks of setup. How long does it typically take to get fully operational?`}</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-white h-[112px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-px pt-[17px] px-[25px] relative size-full">
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[136px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex h-[136px] items-start relative shrink-0 w-full" data-name="Container">
      <Container16 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[578px] items-start relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container11 />
      <Container15 />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[746px] relative shrink-0 w-[1890px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pt-[32px] px-[529px] relative rounded-[inherit] size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[20px] left-[315.64px] top-[96px] w-[200.719px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px]">Mantén presionado para hablar</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Icon">
          <path d={svgPaths.p3912c680} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d={svgPaths.p2c294440} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d="M20 31.6667V36.6667" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#0f172b] content-stretch flex items-center justify-center left-[376px] rounded-[33554400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] size-[80px] top-0" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[116px] relative shrink-0 w-full" data-name="Container">
      <Paragraph3 />
      <Button1 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px not-italic relative text-[#62748e] text-[12px] text-center whitespace-pre-wrap">Responde de forma natural. No hay respuestas incorrectas.</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[220px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[24px] items-start pt-[32px] px-[32px] relative size-full">
        <Container21 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[170.016px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[85.5px] not-italic text-[20px] text-center text-white top-0 tracking-[-0.4492px]">Ver mi feedback</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d="M5 12H19" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 5L19 12L12 19" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#cad5e2] h-[68px] relative rounded-[33554400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 w-[302.016px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center relative size-full">
        <Text1 />
        <Icon2 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex h-[100px] items-start justify-center pt-[32px] relative shrink-0 w-full" data-name="Container">
      <Button2 />
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-white h-[405px] relative shrink-0 w-[1890px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-px px-[497px] relative size-full">
        <Container20 />
        <Container22 />
      </div>
    </div>
  );
}

function VoicePractice() {
  return (
    <div className="bg-[#f8fafc] content-stretch flex flex-col h-[1216px] items-start relative shrink-0 w-full" data-name="VoicePractice">
      <Header />
      <Container5 />
      <Container19 />
    </div>
  );
}

export default function Component8SesionDePractica() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="8. Sesión de práctica">
      <VoicePractice />
    </div>
  );
}