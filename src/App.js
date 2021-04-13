import React, { useRef, useState } from 'react'
import './App.css'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/analytics'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
	apiKey: 'AIzaSyAFUCo1T0HDkEhW8mWDx2ORw3-dHzbZVQ0',
	authDomain: 'brayan-schat.firebaseapp.com',
	projectId: 'brayan-schat',
	storageBucket: 'brayan-schat.appspot.com',
	messagingSenderId: '453663173267',
	appId: '1:453663173267:web:15f1174ca516bb14693b66',
	measurementId: 'G-Y6BFMNTJFW',
})

const auth = firebase.auth()
const firestore = firebase.firestore()
const analytics = firebase.analytics()

function App() {
	const [user] = useAuthState(auth)

	return (
		<div className="App">
			<header>
				<h1>Sofka U</h1>
				<SignOut />
			</header>

			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	)
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider()
		auth.signInWithPopup(provider)
	}

	return (
		<>
			<button className="sign-in" onClick={signInWithGoogle}>
				<span>Sign in with Google</span>
			</button>
			<div className="titleWelcome">
				<h2>Welcome to Sofka chat</h2>
			</div>
		</>
	)
}

function SignOut() {
	return (
		auth.currentUser && (
			<button className="sign-out" onClick={() => auth.signOut()}>
				Sign Out
			</button>
		)
	)
}

function ChatRoom() {
	const dummy = useRef()
	const messagesRef = firestore.collection('messages')
	const query = messagesRef.orderBy('createdAt').limit(100)

	const [messages] = useCollectionData(query, { idField: 'id' })

	const [formValue, setFormValue] = useState('')

	const sendMessage = async (e) => {
		e.preventDefault()

		const { uid, photoURL, displayName } = auth.currentUser

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
			displayName,
		})

		setFormValue('')
		dummy.current.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<>
			<main>
				{messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

				<span ref={dummy}></span>
			</main>

			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
					placeholder="say something nice"
				/>

				<button type="submit" disabled={!formValue}>
					🕊️
				</button>
			</form>
		</>
	)
}

function ChatMessage(props) {
	const { text, uid, photoURL, displayName } = props.message

	console.log(props.displayName)

	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

	return (
		<>
			<div className={`message ${messageClass}`}>
				<img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
				<p>
					{displayName} <br /> {text}
				</p>
			</div>
		</>
	)
}

export default App
