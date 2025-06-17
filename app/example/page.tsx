'use client'

import React from 'react';
import { useSearchParams } from 'next/navigation';

interface Args {
	argA: undefined,
	argB: undefined,
}

// The object wrapping is because components can only take one input
export default function example({argA, argB}: Args) {
	const searchParams = useSearchParams();

	return (<></>);
}