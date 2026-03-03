import svgPaths from "./svg-etggfpo76l";

function Container2() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-[0.5px] not-italic text-[#0f172b] text-[0px] text-[24px] top-0 tracking-[-0.5297px] w-[160px] whitespace-pre-wrap">
        <span className="leading-[32px]">{`inFluentia `}</span>
        <span className="font-['Inter:Light',sans-serif] font-light leading-[32px]">PRO</span>
      </p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-0 tracking-[-0.1504px]">Resultados · Shadowing</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[56px] relative shrink-0 w-[154.203px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container2 />
        <Paragraph />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="h-[24px] relative shrink-0 w-[143.281px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#45556c] text-[16px] top-0 tracking-[-0.3125px]">Volver al dashboard</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[80px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Link />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex flex-col h-[81px] items-start left-0 pb-px px-[201.5px] top-0 w-[1875px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[16px] size-[32px] top-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon">
          <path d={svgPaths.p1dee4500} id="Vector" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.pde53700} id="Vector_2" stroke="var(--stroke-0, #155DFC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#dbeafe] left-[512px] rounded-[33554400px] size-[64px] top-0" data-name="Container">
      <Icon />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[48px] left-0 top-[88px] w-[1088px]" data-name="Heading 1">
      <p className="-translate-x-1/2 absolute font-['Inter:Light',sans-serif] font-light leading-[48px] left-[544.97px] not-italic text-[#0f172b] text-[48px] text-center top-px tracking-[-0.8484px]">Práctica completada</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[28px] left-0 top-[152px] w-[1088px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[543.72px] not-italic text-[#45556c] text-[20px] text-center top-0 tracking-[-0.4492px]">6 frases · 8 minutos</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[180px] left-[32px] top-[48px] w-[1088px]" data-name="Container">
      <Container4 />
      <Heading />
      <Paragraph1 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.p13253c0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M16 7H22V13" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#0f172b] relative rounded-[14px] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon1 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[36px] relative shrink-0 w-[138.797px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Inter:Light',sans-serif] font-light leading-[36px] not-italic relative shrink-0 text-[#0f172b] text-[30px] tracking-[0.3955px]">Tu práctica</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[12px] h-[40px] items-center relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Heading1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[26px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[26px] left-0 not-italic text-[#45556c] text-[16px] top-0 tracking-[-0.3125px]">Hemos identificado algunas oportunidades para mejorar tu claridad y proyección. Estas mejoras son estratégicas, no errores.</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[90px] items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Paragraph2 />
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#314158] text-[14px] tracking-[-0.1504px]">1</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[16px] left-[6px] opacity-70 top-[29px] w-[94px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#7b3306] text-[12px] top-px">/ɪˈvæljueɪtɪŋ/</p>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute bg-[#fef3c6] border border-[#ffd230] border-solid h-[27px] left-[283.5px] rounded-[4px] top-[48px] w-[101px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-[6px] not-italic text-[#7b3306] text-[18px] top-[-1px] tracking-[-0.4395px]">evaluating</p>
      <Text1 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="flex-[1_0_0] h-[76.5px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#1d293d] text-[18px] top-[48.25px] tracking-[-0.4395px] w-[284px] whitespace-pre-wrap">{`Good morning! I understand you're `}</p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-[384.5px] not-italic text-[#1d293d] text-[18px] top-[48px] tracking-[-0.4395px] w-[380px] whitespace-pre-wrap">{`automation platforms for your marketing team. `}</p>
        <Text />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[16px] h-[76.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Paragraph3 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[16.66%_54.17%_16.65%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-6.25%_-11.11%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.16667 15.005">
            <path d={svgPaths.p2a2f40f0} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_29.17%_37.5%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-100%_-16.67%_-100.01%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.50005 6.66676">
            <path d={svgPaths.p5c92300} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[23.48%_8.33%_23.48%_80.68%]" data-name="Vector">
        <div className="absolute inset-[-7.86%_-37.94%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.8634 12.2733">
            <path d={svgPaths.pd112180} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] px-[8px] relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_12.5%_58.33%_70.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8.33333">
            <path d={svgPaths.p17f49c20} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[54.17%] left-[12.5%] right-[12.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-20%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 5.83333">
            <path d={svgPaths.p38730200} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_70.83%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8.33333">
            <path d={svgPaths.p319b5e80} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-[54.17%]" data-name="Vector">
        <div className="absolute inset-[-20%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 5.83333">
            <path d={svgPaths.p55c6100} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] px-[8px] relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Container15() {
  return <div className="flex-[1_0_0] h-0 min-h-px min-w-px" data-name="Container" />;
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p17f48400} id="Vector" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[45.5px] not-italic text-[#314158] text-[14px] text-center top-0 tracking-[-0.1504px]">Power Phrase</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white h-[38px] relative rounded-[10px] shrink-0 w-[148.25px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[17px] py-px relative size-full">
        <Icon4 />
        <Text2 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[12px] h-[55px] items-start pt-[17px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t inset-0 pointer-events-none" />
      <Button />
      <Button1 />
      <Container15 />
      <Button2 />
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[#f8fafc] h-[197.5px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Container12 />
        <Container14 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#314158] text-[14px] tracking-[-0.1504px]">2</p>
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="flex-[1_0_0] h-[29.25px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#1d293d] text-[18px] top-px tracking-[-0.4395px] w-[439px] whitespace-pre-wrap">{`I appreciate you taking the time to meet with me today. `}</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[16px] h-[32px] items-start relative shrink-0 w-full" data-name="Container">
      <Container18 />
      <Paragraph4 />
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-[#f8fafc] h-[98px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Container17 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#314158] text-[14px] tracking-[-0.1504px]">3</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute h-[15px] left-[7px] opacity-70 top-[30px] w-[88px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#1c398e] text-[12px] top-px">/spəˈsɪfɪkli/</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute bg-[#dbeafe] border border-[#8ec5ff] border-solid h-[27px] left-[123.5px] rounded-[4px] top-[48.5px] w-[103px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-[6px] not-italic text-[#1c398e] text-[18px] top-[-1px] tracking-[-0.4395px]">specifically</p>
      <Text4 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="flex-[1_0_0] h-[76.5px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#1d293d] text-[18px] top-[48.25px] tracking-[-0.4395px] w-[124px] whitespace-pre-wrap">{`Our platform is `}</p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-[227.5px] not-italic text-[#1d293d] text-[18px] top-[48.5px] tracking-[-0.4395px] w-[431px] whitespace-pre-wrap">{`designed for mid-sized companies in Latin America. `}</p>
        <Text3 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[16px] h-[76.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container21 />
      <Paragraph5 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[16.66%_54.17%_16.65%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-6.25%_-11.11%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.16667 15.005">
            <path d={svgPaths.p2a2f40f0} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_29.17%_37.5%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-100%_-16.67%_-100.01%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.50005 6.66676">
            <path d={svgPaths.p5c92300} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[23.48%_8.33%_23.48%_80.68%]" data-name="Vector">
        <div className="absolute inset-[-7.86%_-37.94%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.8634 12.2733">
            <path d={svgPaths.pd112180} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] px-[8px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_12.5%_58.33%_70.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8.33333">
            <path d={svgPaths.p17f49c20} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[54.17%] left-[12.5%] right-[12.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-20%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 5.83333">
            <path d={svgPaths.p38730200} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_70.83%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8.33333">
            <path d={svgPaths.p319b5e80} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-[54.17%]" data-name="Vector">
        <div className="absolute inset-[-20%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 5.83333">
            <path d={svgPaths.p55c6100} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] px-[8px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Container23() {
  return <div className="flex-[1_0_0] h-0 min-h-px min-w-px" data-name="Container" />;
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p17f48400} id="Vector" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[45.5px] not-italic text-[#314158] text-[14px] text-center top-0 tracking-[-0.1504px]">Power Phrase</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[38px] relative rounded-[10px] shrink-0 w-[148.25px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[17px] py-px relative size-full">
        <Icon7 />
        <Text5 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[12px] h-[55px] items-start pt-[17px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t inset-0 pointer-events-none" />
      <Button3 />
      <Button4 />
      <Container23 />
      <Button5 />
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-[#f8fafc] h-[197.5px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Container20 />
        <Container22 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#314158] text-[14px] tracking-[-0.1504px]">4</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[15px] left-[6px] opacity-70 top-[30px] w-[75px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#59168b] text-[12px] top-px">/ˈsiːmləs/</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute bg-[#f3e8ff] border border-[#dab2ff] border-solid h-[27px] left-[377.5px] rounded-[4px] top-[48px] w-[90px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-[6px] not-italic text-[#59168b] text-[18px] top-[-1px] tracking-[-0.4395px]">seamless</p>
      <Text7 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="flex-[1_0_0] h-[76.5px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-0 not-italic text-[#1d293d] text-[18px] top-[48.25px] tracking-[-0.4395px] w-[378px] whitespace-pre-wrap">{`The main differentiator is bilingual support and `}</p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[29.25px] left-[473.5px] not-italic text-[#1d293d] text-[18px] top-[48px] tracking-[-0.4395px] w-[361px] whitespace-pre-wrap">{`integrations with local payment processors. `}</p>
        <Text6 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[16px] h-[76.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Paragraph6 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[16.66%_54.17%_16.65%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-6.25%_-11.11%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.16667 15.005">
            <path d={svgPaths.p2a2f40f0} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_29.17%_37.5%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-100%_-16.67%_-100.01%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.50005 6.66676">
            <path d={svgPaths.p5c92300} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[23.48%_8.33%_23.48%_80.68%]" data-name="Vector">
        <div className="absolute inset-[-7.86%_-37.94%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.8634 12.2733">
            <path d={svgPaths.pd112180} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] px-[8px] relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_12.5%_58.33%_70.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8.33333">
            <path d={svgPaths.p17f49c20} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[54.17%] left-[12.5%] right-[12.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-20%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 5.83333">
            <path d={svgPaths.p38730200} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_70.83%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8.33333">
            <path d={svgPaths.p319b5e80} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-[54.17%]" data-name="Vector">
        <div className="absolute inset-[-20%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 5.83333">
            <path d={svgPaths.p55c6100} id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[8px] px-[8px] relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Container28() {
  return <div className="flex-[1_0_0] h-0 min-h-px min-w-px" data-name="Container" />;
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p17f48400} id="Vector" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text8() {
  return (
    <div className="flex-[1_0_0] h-[20px] min-h-px min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[45.5px] not-italic text-[#314158] text-[14px] text-center top-0 tracking-[-0.1504px]">Power Phrase</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-white h-[38px] relative rounded-[10px] shrink-0 w-[148.25px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[17px] py-px relative size-full">
        <Icon10 />
        <Text8 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex gap-[12px] h-[55px] items-start pt-[17px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-solid border-t inset-0 pointer-events-none" />
      <Button6 />
      <Button7 />
      <Container28 />
      <Button8 />
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-[#f8fafc] h-[197.5px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Container25 />
        <Container27 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[762.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Container16 />
      <Container19 />
      <Container24 />
    </div>
  );
}

function Container6() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[32px] items-start justify-self-stretch relative row-1 self-stretch shrink-0" data-name="Container">
      <Container7 />
      <Container10 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#0f172b] text-[16px] top-0 tracking-[-0.3125px]">Áreas de mejora</p>
    </div>
  );
}

function Container33() {
  return <div className="absolute bg-[#fef3c6] border border-[#ffd230] border-solid left-0 rounded-[4px] size-[16px] top-[4px]" data-name="Container" />;
}

function Container35() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] top-0 tracking-[-0.1504px]">Claridad</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#45556c] text-[12px] top-0">Pronunciación que impacta comprensión</p>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[43.5px] items-start left-[28px] top-0 w-[229.813px]" data-name="Container">
      <Container35 />
      <Container36 />
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[43.5px] relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Container38() {
  return <div className="absolute bg-[#dbeafe] border border-[#8ec5ff] border-solid left-0 rounded-[4px] size-[16px] top-[4px]" data-name="Container" />;
}

function Container40() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] top-0 tracking-[-0.1504px]">Ritmo</p>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#45556c] text-[12px] top-0">Pausas estratégicas para énfasis</p>
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[43.5px] items-start left-[28px] top-0 w-[185.281px]" data-name="Container">
      <Container40 />
      <Container41 />
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[43.5px] relative shrink-0 w-full" data-name="Container">
      <Container38 />
      <Container39 />
    </div>
  );
}

function Container43() {
  return <div className="absolute bg-[#f3e8ff] border border-[#dab2ff] border-solid left-0 rounded-[4px] size-[16px] top-[4px]" data-name="Container" />;
}

function Container45() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] top-0 tracking-[-0.1504px]">Entonación</p>
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[19.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#45556c] text-[12px] top-0">Énfasis que proyecta autoridad</p>
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[43.5px] items-start left-[28px] top-0 w-[175.172px]" data-name="Container">
      <Container45 />
      <Container46 />
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[43.5px] relative shrink-0 w-full" data-name="Container">
      <Container43 />
      <Container44 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[162.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container32 />
      <Container37 />
      <Container42 />
    </div>
  );
}

function Container30() {
  return (
    <div className="bg-white h-[260.5px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading2 />
        <Container31 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#0f172b] text-[16px] top-0 tracking-[-0.3125px]">Notas de pronunciación</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[84.453px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">evaluating</p>
    </div>
  );
}

function Text10() {
  return (
    <div className="absolute h-[20px] left-[92.45px] top-[5px] w-[118.016px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#62748e] text-[14px] top-px">/ɪˈvæljueɪtɪŋ/</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <Text9 />
      <Text10 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[22.75px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Enfatiza la segunda sílaba: e-VAL-u-ating. Esto proyecta más confianza.</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[83.75px] items-start pb-px relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <Container50 />
      <Paragraph7 />
    </div>
  );
}

function Text11() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[92.078px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">specifically</p>
    </div>
  );
}

function Text12() {
  return (
    <div className="absolute h-[20px] left-[100.08px] top-[5px] w-[109.578px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#62748e] text-[14px] top-px">/spəˈsɪfɪkli/</p>
    </div>
  );
}

function Container52() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <Text11 />
      <Text12 />
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[22.75px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">Pausa ligeramente después de esta palabra para dar peso a tu diferenciador.</p>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[83.75px] items-start pb-px relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-b border-solid inset-0 pointer-events-none" />
      <Container52 />
      <Paragraph8 />
    </div>
  );
}

function Text13() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[76.906px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] top-0 tracking-[-0.4395px]">seamless</p>
    </div>
  );
}

function Text14() {
  return (
    <div className="absolute h-[20px] left-[84.91px] top-[5px] w-[84.297px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#62748e] text-[14px] top-px">/ˈsiːmləs/</p>
    </div>
  );
}

function Container54() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Container">
      <Text13 />
      <Text14 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[22.75px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] left-0 not-italic text-[#314158] text-[14px] top-0 tracking-[-0.1504px]">La primera sílaba es larga (SEAM-less). Esto hace que suene más premium.</p>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[58.75px] items-start relative shrink-0 w-full" data-name="Container">
      <Container54 />
      <Paragraph9 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[274.25px] items-start relative shrink-0 w-full" data-name="Container">
      <Container49 />
      <Container51 />
      <Container53 />
    </div>
  );
}

function Container47() {
  return (
    <div className="bg-[#f8fafc] h-[372.25px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex flex-col gap-[24px] items-start pb-px pt-[25px] px-[25px] relative size-full">
        <Heading3 />
        <Container48 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-white top-0 tracking-[-0.3125px]">Power Phrases</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[22.75px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] left-0 not-italic text-[#cad5e2] text-[14px] top-0 tracking-[-0.1504px]">Guarda las frases que quieres dominar. Las encontrarás en tu biblioteca personal para practicar cuando quieras.</p>
    </div>
  );
}

function Container56() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#90a1b9] text-[12px] top-0 w-[109px] whitespace-pre-wrap">0 frases guardadas</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[138.75px] relative rounded-[16px] shrink-0 w-full" data-name="Container" style={{ backgroundImage: "linear-gradient(172.732deg, rgb(15, 23, 43) 0%, rgb(29, 41, 61) 100%)" }}>
      <div className="content-stretch flex flex-col gap-[12px] items-start pt-[24px] px-[24px] relative size-full">
        <Heading4 />
        <Paragraph10 />
        <Container56 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[24px] items-start justify-self-stretch relative row-2 self-stretch shrink-0" data-name="Container">
      <Container30 />
      <Container47 />
      <Container55 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute gap-x-[32px] gap-y-[32px] grid grid-cols-[repeat(1,minmax(0,1fr))] grid-rows-[__minmax(0,884.50fr)_minmax(0,1fr)] h-[916px] left-[32.5px] top-[292px] w-[1088px]" data-name="Container">
      <Container6 />
      <Container29 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3610ce00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1e08a620} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p3931fd80} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p1c172000} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function ShadowingResults() {
  return (
    <div className="h-[28px] relative shrink-0 w-[142.188px]" data-name="ShadowingResults">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-0 not-italic text-[20px] text-white top-0 tracking-[-0.4492px]">Repetir práctica</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="bg-[#0f172b] h-[68px] relative rounded-[33554400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] shrink-0 w-[254.188px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center justify-center relative size-full">
        <Icon11 />
        <ShadowingResults />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p38f8300} id="Vector" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pf973700} id="Vector_2" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p14392758} id="Vector_3" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[28px] relative shrink-0 w-[135.547px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[68.5px] not-italic text-[#0f172b] text-[20px] text-center top-0 tracking-[-0.4492px]">Guardar sesión</p>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="h-[72px] relative rounded-[33554400px] shrink-0 w-[247.547px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[33554400px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center p-[2px] relative size-full">
        <Icon12 />
        <Text15 />
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[72px] items-center justify-center left-[32px] pr-[0.016px] top-[2076px] w-[1088px]" data-name="Container">
      <Link1 />
      <Button9 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="absolute h-[28px] left-[32px] top-[2196px] w-[1088px]" data-name="Paragraph">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[544px] not-italic text-[#45556c] text-[18px] text-center top-0 tracking-[-0.4395px]">La pronunciación clara no es perfección, es intención y práctica estratégica</p>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[64px] relative rounded-[33554400px] shrink-0 w-[383.453px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-2 border-[#0f172b] border-solid inset-0 pointer-events-none rounded-[33554400px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[66px] py-[18px] relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#0f172b] text-[18px] tracking-[-0.4395px]">Terminar y volver al dashboard</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute content-stretch flex h-[64px] items-start justify-center left-[32px] pr-[0.016px] top-[2248px] w-[1088px]" data-name="Container">
      <Link2 />
    </div>
  );
}

function MainContent() {
  return (
    <div className="absolute h-[2360px] left-[361.5px] top-[81px] w-[1152px]" data-name="Main Content">
      <Container3 />
      <Container5 />
      <Container57 />
      <Paragraph11 />
      <Container58 />
    </div>
  );
}

export default function Component12PracticaCompletada() {
  return (
    <div className="bg-white relative size-full" data-name="12. Practica completada">
      <Header />
      <MainContent />
    </div>
  );
}