-> From db package
1. Removing attempt[] and progress[] from challenge and challengeStep tables
2. Removing version related tables , version related logic in challengeRegistry , challengeSync and from everywhere else
3. removing attempt table completely

-> from challenges

1. each step can have multiple slides
2. slide layer will have content and control of the main component which will contain terminal and visualizer
3. means interactive-engine will have a component named Canvas which takes control and content from slide layer
4. our challenge.json file will look something like this 

{
    "id:"",
    "title":"some title",
    "type":"challenge"or"quest",
    "steps":[
        {
            "id":"unique step id",
            "title":"optional title",
            "interactive-sequence.json":"file path",
        },
        {
            "id":"unique step id",
            "title":"optional title",
            "interactive-sequence.json":"file path",
        }
    ]

}




5. slides will look something like this ( our interactive-sequence.json file inside each step folder )
{
    slides:[
        {
    "id":"unique slide id",
    "title":"optional title",

    canvasSetting:{
        terminal:true,
        guide:true,
        visualizer:true,
        terminalLang:"for now git or linux",
        "defaultRender":"guide"


    },
    content:[
        {
            "type":"interactive-engine component type ",
            "args":"component arguments",
        },
        {
            "type":"interactive-engine component type ",
            "args":"component arguments",
        }
    ]
    
    ,

},{
    "id":"unique slide id",
    "title":"optional title",
    
    canvasSetting:{
        terminal:true,
        guide:true,
        visualizer:true

    },
    content:[
        {
            "type":"interactive-engine component type ",
            "args":"component arguments",
        },
        {
            "type":"interactive-engine component type ",
            "args":"component arguments",
        }
    ]
    
    ,

}



    ]
}

=> now interactive engine will have a guide component which will bascially be a parent container , which will
   go through the slides.content array and render component according to the type defined and will pass 
   args given in content.args field.

=> no previous versions code , clean and clear and so update challengeRegistry , challnegeSync and seed according
   to our new format .

=> and so canvas and guide and visualWorld and terminal component of interactive-engine is taking all decision,
   our web component will not have any power regarding this , everything should be inside interactive-engine.
   and interactive-engine component will follow , challenges json file data will be the source of truth for 
   content and config and appearance and there should be separation of concern and each layer should be 
   focused on doing one thing and things should be molicular , and so update api accordingly .

=> remove old quests and code related to older schema and format and everything and start fresh .
=> to see this new thing in action create a new quest relatd to backend in nodejs , just two steps for now 
   and each step should have multiple slides

=> also there will two types of courses - challenge and quests.






