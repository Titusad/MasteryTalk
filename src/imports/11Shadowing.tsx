import svgPaths from "./svg-4ylap7s3dl";

function Container2() {
  return (
    <div className="h-[28px] relative shrink-0 w-[123.047px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[0.5px] not-italic text-[#0f172b] text-[0px] text-[20px] top-0 tracking-[-0.9492px] w-[131px] whitespace-pre-wrap">
          <span className="leading-[28px]">{`inFluentia `}</span>
          <span className="font-['Inter:Light',sans-serif] font-light leading-[28px]">PRO</span>
        </p>
      </div>
    </div>
  );
}

function Container3() {
  return <div className="bg-[#e2e8f0] h-[24px] shrink-0 w-px" data-name="Container" />;
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p39ac0980} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p33554180} id="Vector_2" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p30a38f00} id="Vector_3" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px]">Shadowing · Sales pitch</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Icon />
        <Text />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[28px] relative shrink-0 w-[333.609px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container2 />
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function Icon1() {
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

function Text1() {
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
        <Icon1 />
        <Text1 />
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
    <div className="h-[65px] relative shrink-0 w-[1875px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px px-[201.5px] relative size-full">
        <Container />
      </div>
    </div>
  );
}

function Container8() {
  return <div className="bg-[#0f172b] h-[8px] rounded-[33554400px] shrink-0 w-full" data-name="Container" />;
}

function Container7() {
  return (
    <div className="bg-[#f1f5f9] flex-[1_0_0] h-[8px] min-h-px min-w-px relative rounded-[33554400px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pr-[475.563px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[29.328px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[-0.17px] not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px] w-[48px] whitespace-pre-wrap">4 / 6</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[16px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container9 />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[53px] relative shrink-0 w-[1875px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px pt-[16px] px-[201.5px] relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[20px] left-[16px] top-[8px] w-[206.906px]" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[103px] not-italic text-[#45556c] text-[14px] text-center top-0 tracking-[-0.1504px]">Presiona play cuando estés listo</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute bg-[#f8fafc] border border-[#e2e8f0] border-solid h-[38px] left-[327.55px] rounded-[33554400px] top-0 w-[240.906px]" data-name="Container">
      <Text2 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[175.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Light',sans-serif] font-light leading-[58.5px] left-[398.27px] not-italic text-[#0f172b] text-[36px] text-center top-0 tracking-[0.3691px] w-[694px] whitespace-pre-wrap">The main differentiator is bilingual support and seamless integrations with local payment processors.</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bg-[#f8fafc] content-stretch flex flex-col h-[275.5px] items-start left-0 pb-[2px] pt-[50px] px-[50px] rounded-[24px] top-[86px] w-[896px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <Paragraph />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2110f1c0} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 2.5V6.66667H6.66667" id="Vector_2" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[33554400px] shrink-0 size-[56px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[33554400px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Icon">
          <path d="M10 5L33.3333 20L10 35V5Z" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#0f172b] flex-[1_0_0] h-[80px] min-h-px min-w-px relative rounded-[33554400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[4px] relative size-full">
          <Icon3 />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return <div className="shrink-0 size-[56px]" data-name="Container" />;
}

function Container15() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[224px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Button1 />
        <Button2 />
        <Container16 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[235.797px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[118.5px] not-italic text-[#45556c] text-[16px] text-center top-0 tracking-[-0.3125px]">Presiona play para escuchar</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[128px] items-center left-0 top-[409.5px] w-[896px]" data-name="Container">
      <Container15 />
      <Paragraph1 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[537.5px] relative shrink-0 w-[896px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container12 />
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[610px] relative shrink-0 w-[1875px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container11 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Todas las frases</p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_15_2589)" id="Icon">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_15_2589">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute bg-[#dcfce7] content-stretch flex items-center justify-center left-0 rounded-[33554400px] size-[24px] top-[2px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[22.75px] left-[36px] top-0 w-[762px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">{`Good morning! I understand you're evaluating automation platforms for your marketing team.`}</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[26px] left-[17px] top-[13px] w-[798px]" data-name="Container">
      <Container21 />
      <Paragraph2 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white h-[52px] opacity-60 relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container20 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_15_2589)" id="Icon">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_15_2589">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute bg-[#dcfce7] content-stretch flex items-center justify-center left-0 rounded-[33554400px] size-[24px] top-[2px]" data-name="Container">
      <Icon5 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[22.75px] left-[36px] top-0 w-[762px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">I appreciate you taking the time to meet with me today.</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[26px] left-[17px] top-[13px] w-[798px]" data-name="Container">
      <Container23 />
      <Paragraph3 />
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white h-[52px] opacity-60 relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container22 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_15_2589)" id="Icon">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p17134c00} id="Vector_2" stroke="var(--stroke-0, #00A63E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_15_2589">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute bg-[#dcfce7] content-stretch flex items-center justify-center left-0 rounded-[33554400px] size-[24px] top-[2px]" data-name="Container">
      <Icon6 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[22.75px] left-[36px] top-0 w-[762px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Our platform is specifically designed for mid-sized companies in Latin America.</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[26px] left-[17px] top-[13px] w-[798px]" data-name="Container">
      <Container25 />
      <Paragraph4 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[52px] opacity-60 relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container24 />
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[7.906px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-white">4</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute bg-[#0f172b] content-stretch flex items-center justify-center left-0 rounded-[33554400px] size-[24px] top-[2px]" data-name="Container">
      <Text3 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[22.75px] left-[36px] top-0 w-[760px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#0f172b] text-[14px] top-0 tracking-[-0.1504px]">The main differentiator is bilingual support and seamless integrations with local payment processors.</p>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[26px] left-[18px] top-[14px] w-[796px]" data-name="Container">
      <Container27 />
      <Paragraph5 />
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white h-[54px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#0f172b] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <Container26 />
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16px] relative shrink-0 w-[7.609px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#45556c] text-[12px]">5</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute bg-[#f1f5f9] content-stretch flex items-center justify-center left-0 pr-[0.016px] rounded-[33554400px] size-[24px] top-[2px]" data-name="Container">
      <Text4 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[22.75px] left-[36px] top-0 w-[762px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">{`Something most global platforms don't offer.`}</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute h-[26px] left-[17px] top-[13px] w-[798px]" data-name="Container">
      <Container29 />
      <Paragraph6 />
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-white h-[52px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container28 />
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[7.828px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#45556c] text-[12px]">6</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute bg-[#f1f5f9] content-stretch flex items-center justify-center left-0 pr-[0.016px] rounded-[33554400px] size-[24px] top-[2px]" data-name="Container">
      <Text5 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[45.5px] left-[36px] top-0 w-[762px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px] w-[732px] whitespace-pre-wrap">Great question about the timeline. Let me break this into three parts: initial setup, team training, and going fully operational.</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[45.5px] left-[17px] top-[13px] w-[798px]" data-name="Container">
      <Container31 />
      <Paragraph7 />
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-white h-[71.5px] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container30 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[373.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[28px] relative shrink-0 w-[170.016px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[85px] not-italic text-[20px] text-center text-white top-0 tracking-[-0.4492px]">Terminar</p>
      </div>
    </div>
  );
}

function Icon7() {
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

function Button9() {
  return (
    <div className="bg-[#cad5e2] h-[68px] relative rounded-[33554400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 w-[302.016px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center relative size-full">
        <Text6 />
        <Icon7 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex h-[100px] items-start justify-center pt-[32px] relative shrink-0 w-full" data-name="Container">
      <Button9 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[579px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start pt-[32px] px-[32px] relative size-full">
        <Heading />
        <Container19 />
        <Container32 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#f8fafc] h-[615px] relative shrink-0 w-[1875px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-px px-[489.5px] relative size-full">
        <Container18 />
      </div>
    </div>
  );
}

export default function Component11Shadowing() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pb-[-10px] relative size-full" data-name="11. Shadowing">
      <Header />
      <Container5 />
      <Container10 />
      <Container17 />
    </div>
  );
}