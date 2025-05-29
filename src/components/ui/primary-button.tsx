'use client'
interface ButtonProps{
    label:string,
    type?: "button" | "submit" | "reset"
}
export default function PrimaryButton(props:ButtonProps) {
    return (
        <button type={props.type} className="btn btn-primary">
            {props.label}
        </button>
    );
}